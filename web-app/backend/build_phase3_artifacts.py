"""Build phase-3 preprocessing artifacts.

Goal
----
Create a fitted preprocessing bundle at:
    web-app/backend/models/preprocessing_artifacts.joblib

This bundle is used at inference time to transform raw ADNI CSV rows into the exact
8648-column schema expected by `best_adni_xgboost_model_phase_3.pkl`.

Important: This script does NOT retrain the XGBoost model.

What it does
------------
- Loads and merges the ADNI CSVs in the provided folder.
- Infers the expected feature schema from the saved phase-3 model itself.
- Fits imputers + scaler for numeric features found in the merged table.
- Fits OneHotEncoders with fixed categories inferred from the model feature names.

Usage (PowerShell)
------------------
    python build_phase3_artifacts.py --data-dir "C:/Users/abdel/Downloads/ADNI_Datasets"
"""

import argparse
import os
import warnings

import joblib
import numpy as np
import pandas as pd

from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from adni_dataset import ADNIDataPaths, ADNIDataStore

warnings.filterwarnings("ignore")


def _make_onehot_encoder(categories=None):
    # scikit-learn changed arg name from sparse -> sparse_output
    try:
        return OneHotEncoder(
            sparse_output=False,
            handle_unknown="ignore",
            categories=categories,
        )
    except TypeError:
        return OneHotEncoder(
            sparse=False,
            handle_unknown="ignore",
            categories=categories,
        )


def _load_model_feature_schema(model_path: str) -> list[str]:
    model = joblib.load(model_path)
    return [str(c) for c in model.get_booster().feature_names]


def _infer_onehot_categories(model_features: list[str]) -> dict[str, list[str]]:
    """Infer one-hot categories from feature names like COLPROT_ADNI1, PTMARRY_Married, etc.

We treat any feature name containing an underscore as potentially a one-hot column,
but we only keep it if it looks like a base column + '_' + category.

We also intentionally ignore VISCODE_ptd (which is a base col) and *_ptd (missingness).
"""

    categories_by_col: dict[str, list[str]] = {}

    for feat in model_features:
        if feat.endswith("_ptd"):
            continue
        # VISCODE_ptd_bl is a legitimate one-hot (base=VISCODE_ptd)
        if "_" not in feat:
            continue

        base, rest = feat.split("_", 1)
        if not base or not rest:
            continue
        # Avoid incorrectly treating numeric engineered cols like ABETA_bl as one-hot.
        # Heuristic: if base exists as a raw column in merges, we'll decide later.
        categories_by_col.setdefault(base, []).append(rest)

    # De-dup while preserving order
    for k, v in list(categories_by_col.items()):
        seen = set()
        out = []
        for item in v:
            if item in seen:
                continue
            seen.add(item)
            out.append(item)
        categories_by_col[k] = out

    return categories_by_col


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-dir", required=True, help="Folder containing the ADNI CSVs")

    parser.add_argument("--adnimerge", default="ADNIMERGE_10Nov2025.csv")
    parser.add_argument("--cdr", default="Dementia_Rating.csv")
    parser.add_argument("--diag", default="Diagnositic_Summary.csv")
    parser.add_argument("--cog", default="Cognitive_Scores.csv")
    parser.add_argument("--ptdemog", default="PTDEMOG_10Nov2025.csv")
    parser.add_argument("--apoe", default="ApoE_Genotyping.csv")

    parser.add_argument(
        "--model-path",
        default=os.path.join(os.path.dirname(__file__), "models", "best_adni_xgboost_model_phase_3.pkl"),
        help="Path to the trained phase-3 model (.pkl)",
    )
    args = parser.parse_args()

    data_dir = args.data_dir

    # Load merged table from the raw ADNI CSVs
    store = ADNIDataStore(
        ADNIDataPaths(
            data_dir=data_dir,
            adnimerge=args.adnimerge,
            dementia_rating=args.cdr,
            diagnostic_summary=args.diag,
            cognitive_scores=args.cog,
            ptdemog=args.ptdemog,
            apoe=args.apoe,
        )
    )
    merged = store.load()

    model_features = _load_model_feature_schema(args.model_path)
    model_feature_set = set(model_features)

    # Determine base numeric features we can scale/impute.
    # Only keep columns that exist BOTH in merged table and model schema.
    merged_numeric_cols = set(merged.select_dtypes(include=[np.number]).columns)
    num_cols = sorted(list((merged_numeric_cols & model_feature_set)))

    # Determine categorical columns to one-hot based on model schema.
    inferred_categories = _infer_onehot_categories(model_features)
    # Keep only bases that actually exist in merged table
    cat_cols = sorted([c for c in inferred_categories.keys() if c in merged.columns])

    # Fit imputers/scaler
    # Some ADNI columns can be entirely missing; we must preserve them to keep schema stable.
    try:
        num_imputer = SimpleImputer(strategy="median", keep_empty_features=True)
        cat_imputer = SimpleImputer(strategy="most_frequent", keep_empty_features=True)
    except TypeError:
        # Older sklearn
        num_imputer = SimpleImputer(strategy="median")
        cat_imputer = SimpleImputer(strategy="most_frequent")
    scaler = StandardScaler()
    if num_cols:
        X_num = pd.DataFrame(num_imputer.fit_transform(merged[num_cols]), columns=num_cols)
        scaler.fit(X_num)

    # Fit one-hot encoders with fixed categories inferred from the model
    cat_encoders = {}
    if cat_cols:
        X_cat = pd.DataFrame(cat_imputer.fit_transform(merged[cat_cols]), columns=cat_cols)
        for col in cat_cols:
            cats = inferred_categories.get(col)
            if not cats:
                continue
            enc = _make_onehot_encoder(categories=[cats])
            enc.fit(X_cat[[col]])
            cat_encoders[col] = ("onehot", enc)

    # Precompute which *_ptd missingness flags the model expects
    ptd_indicator_features = [c for c in model_features if c.endswith("_ptd")]

    artifacts = {
        # Compatibility keys used by Phase3Preprocessor
        "missingness_threshold": None,
        "cols_dropped_missingness": [],
        "num_cols": num_cols,
        "cat_cols": cat_cols,
        "num_imputer": num_imputer,
        "cat_imputer": cat_imputer,
        "log_shifts": {},
        "yeojohnson_models": {},
        "scaler": scaler,
        "cat_encoders": cat_encoders,
        "pca": None,
        # Critical: align to EXACT model feature schema
        "final_columns": model_features,
        "model_schema_columns": model_features,
        "ptd_indicator_features": ptd_indicator_features,
    }

    out_path = os.path.join(os.path.dirname(__file__), "models", "preprocessing_artifacts.joblib")
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    joblib.dump(artifacts, out_path)

    print(f"Saved preprocessing artifacts to: {out_path}")
    print(f"Model schema column count: {len(model_features)}")
    print(f"Numeric cols fitted: {len(num_cols)}")
    print(f"Categorical cols fitted: {len(cat_cols)}")


if __name__ == "__main__":
    main()
