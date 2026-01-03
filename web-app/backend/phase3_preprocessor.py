import os
from dataclasses import dataclass
from typing import Any, Dict, Tuple

import joblib
import numpy as np
import pandas as pd


@dataclass(frozen=True)
class Phase3Artifacts:
    missingness_threshold: float
    cols_dropped_missingness: list
    num_cols: list
    cat_cols: list
    num_imputer: Any
    cat_imputer: Any
    log_shifts: Dict[str, float]
    yeojohnson_models: Dict[str, Any]
    scaler: Any
    cat_encoders: Dict[str, Tuple[str, Any]]
    pca: Any
    final_columns: list


def load_phase3_artifacts(artifacts_path: str) -> Phase3Artifacts:
    raw = joblib.load(artifacts_path)
    return Phase3Artifacts(
        missingness_threshold=raw.get('missingness_threshold'),
        cols_dropped_missingness=raw.get('cols_dropped_missingness', []),
        num_cols=raw.get('num_cols', []),
        cat_cols=raw.get('cat_cols', []),
        num_imputer=raw.get('num_imputer'),
        cat_imputer=raw.get('cat_imputer'),
        log_shifts=raw.get('log_shifts', {}),
        yeojohnson_models=raw.get('yeojohnson_models', {}),
        scaler=raw.get('scaler'),
        cat_encoders=raw.get('cat_encoders', {}),
        pca=raw.get('pca'),
        final_columns=raw.get('final_columns', []),
    )


class Phase3Preprocessor:
    """Applies the exact preprocessing steps from preprocessing_phase_3.ipynb.

    Requires a fitted `preprocessing_artifacts.joblib` produced by that notebook.
    """

    def __init__(self, artifacts_path: str):
        if not os.path.exists(artifacts_path):
            raise FileNotFoundError(f'Artifacts not found: {artifacts_path}')
        self.artifacts_path = artifacts_path
        self.art = load_phase3_artifacts(artifacts_path)

    def transform_one(self, patient_data: Dict[str, Any]) -> pd.DataFrame:
        if patient_data is None or not isinstance(patient_data, dict):
            raise ValueError('patient_data must be a dict')

        df = pd.DataFrame([patient_data])

        # Drop columns that were removed for missingness during training
        if self.art.cols_dropped_missingness:
            df = df.drop(columns=[c for c in self.art.cols_dropped_missingness if c in df.columns], errors='ignore')

        # Ensure all expected raw columns exist
        for c in self.art.num_cols:
            if c not in df.columns:
                df[c] = np.nan
        for c in self.art.cat_cols:
            if c not in df.columns:
                df[c] = np.nan

        # Numeric impute
        X_num = pd.DataFrame(
            self.art.num_imputer.transform(df[self.art.num_cols]) if self.art.num_cols else np.empty((len(df), 0)),
            columns=self.art.num_cols,
            index=df.index,
        )

        # Apply log1p shifts + Yeo-Johnson where applicable
        # Notebook logic: for each skewed col, shift so min>=0 then log1p, then optional PowerTransformer
        for col, shift in (self.art.log_shifts or {}).items():
            if col not in X_num.columns:
                continue
            X_num[col] = np.log1p(X_num[col] + float(shift))

            pt = (self.art.yeojohnson_models or {}).get(col)
            if pt is not None:
                X_num[col] = pt.transform(X_num[[col]])

        # Scale numeric
        if self.art.num_cols:
            X_scaled = pd.DataFrame(
                self.art.scaler.transform(X_num),
                columns=self.art.num_cols,
                index=df.index,
            )
        else:
            X_scaled = pd.DataFrame(index=df.index)

        # Categorical impute
        if self.art.cat_cols:
            X_cat = pd.DataFrame(
                self.art.cat_imputer.transform(df[self.art.cat_cols]),
                columns=self.art.cat_cols,
                index=df.index,
            )
        else:
            X_cat = pd.DataFrame(index=df.index)

        # Encode categorical using saved encoders
        encoded_parts = []
        for col in self.art.cat_cols:
            kind_enc = (self.art.cat_encoders or {}).get(col)
            if not kind_enc:
                continue
            kind, enc = kind_enc
            if kind == 'ordinal':
                out = enc.transform(X_cat[[col]])
                encoded_parts.append(pd.DataFrame(out, columns=[col], index=df.index))
            elif kind == 'onehot':
                out = enc.transform(X_cat[[col]])
                categories = list(enc.categories_[0])
                oh_cols = [f"{col}_{c}" for c in categories]
                encoded_parts.append(pd.DataFrame(out, columns=oh_cols, index=df.index))

        X_cat_enc = pd.concat(encoded_parts, axis=1) if encoded_parts else pd.DataFrame(index=df.index)

        X_final = pd.concat([X_scaled, X_cat_enc], axis=1)

        # Populate *_ptd missingness-indicator columns if the model expects them.
        # Convention: base present -> 0, missing/absent -> 1
        ptd_feats = getattr(self.art, 'ptd_indicator_features', None)
        if not ptd_feats:
            # If stored in raw joblib dict instead of dataclass
            try:
                raw = joblib.load(self.artifacts_path)
                ptd_feats = raw.get('ptd_indicator_features', [])
            except Exception:
                ptd_feats = []
        if ptd_feats:
            row = df.iloc[0]
            for ptd_col in ptd_feats:
                if not isinstance(ptd_col, str) or not ptd_col.endswith('_ptd'):
                    continue
                base_col = ptd_col[:-4]
                has_value = (base_col in df.columns) and (pd.notna(row.get(base_col)))
                X_final[ptd_col] = 0.0 if has_value else 1.0

        # Some inputs can cause duplicate column names (e.g., overlapping raw + encoded names).
        # Collapse duplicates deterministically to avoid pandas reindex errors.
        if X_final.columns.duplicated().any():
            X_final = X_final.T.groupby(level=0).max().T

        # Align to final training columns
        final_cols = list(self.art.final_columns or [])
        if not final_cols:
            raise ValueError('Artifacts missing final_columns; cannot align')

        X_final = X_final.reindex(columns=final_cols, fill_value=0)
        return X_final
