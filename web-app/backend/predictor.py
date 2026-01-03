import joblib
import pandas as pd
import re
import numpy as np
import os

from phase3_preprocessor import Phase3Preprocessor

class ADNIPredictor:
    def __init__(self, model_path, label_encoder_path=None):
        # 1. Load the trained XGBoost model
        self.model = joblib.load(model_path)
        
        # 2. Extract feature names the model was trained on
        # XGBoost may return numpy.str_ values; normalize to plain Python strings
        self.model_features = [str(c) for c in self.model.get_booster().feature_names]
        
        # 3. Load LabelEncoder to convert 0,1,2 back to AD, CN, MCI
        if label_encoder_path and os.path.exists(label_encoder_path):
            self.le = joblib.load(label_encoder_path)
        else:
            # Fallback mapping if no encoder available
            self.le = None
            self.label_map = {0: 'AD', 1: 'CN', 2: 'MCI'}

        self._categorical_fields = {
            'PTMARRY',
            'VISCODE_ptd',
        }

        # Optional: use the fitted preprocessing artifacts from preprocessing_phase_3.ipynb
        self.preprocessor = None
        artifacts_path = os.path.join(os.path.dirname(__file__), 'models', 'preprocessing_artifacts.joblib')
        if os.path.exists(artifacts_path):
            self.preprocessor = Phase3Preprocessor(artifacts_path)

        # Cache any *_ptd missingness-indicator columns the model expects.
        # These are used in the training pipeline to mark whether the base feature was missing.
        self._ptd_indicator_features = [c for c in self.model_features if c.endswith('_ptd')]

    def _preprocess(self, input_df):
        """Internal method to clean and align data."""
        # If we have the fitted phase-3 preprocessing artifacts, use them.
        # NOTE: This expects raw (pre-encoded) columns and will output the exact training column set.
        if self.preprocessor is not None:
            patient_dict = input_df.iloc[0].to_dict()
            return self.preprocessor.transform_one(patient_dict)

        # Fallback path (no preprocessing artifacts available):
        # - Compute a couple of derived features the model expects
        # - Populate *_ptd missingness flags based on what the caller provided
        df = input_df.copy()

        # Derived APOE4 features (common in ADNI feature sets)
        if 'APOE4' in df.columns and not df['APOE4'].isna().all():
            # APOE4 is usually count of e4 alleles (0/1/2)
            if 'APOE4_count' in self.model_features and 'APOE4_count' not in df.columns:
                df['APOE4_count'] = pd.to_numeric(df['APOE4'], errors='coerce')
            if 'APOE4_carrier' in self.model_features and 'APOE4_carrier' not in df.columns:
                ap = pd.to_numeric(df['APOE4'], errors='coerce')
                df['APOE4_carrier'] = (ap >= 1).astype(float)

        # Missingness indicator flags: base feature present -> 0, absent -> 1
        if self._ptd_indicator_features:
            row = df.iloc[0]
            for ptd_col in self._ptd_indicator_features:
                base_col = ptd_col[:-4]
                has_value = (base_col in df.columns) and (pd.notna(row.get(base_col)))
                df[ptd_col] = 0.0 if has_value else 1.0

        # One-hot encode categoricals
        df_proc = pd.get_dummies(df)
        
        # Clean special characters (must match training exactly)
        df_proc.columns = [re.sub(r'[\[\]<>]', '_', str(col)) for col in df_proc.columns]
        
        # Reindex to ensure same column order and fill missing columns with 0
        df_proc = df_proc.reindex(columns=self.model_features, fill_value=0)
        return df_proc

    def _assess_risk(self, prediction, confidence, probabilities):
        if prediction == 'CN':
            if probabilities['MCI'] > 0.3 or probabilities['AD'] > 0.2:
                risk_level = 'Moderate'
                message = 'Patient shows some risk indicators for cognitive decline'
            else:
                risk_level = 'Low'
                message = 'Patient appears cognitively normal with low risk'
        elif prediction == 'MCI':
            if probabilities['AD'] > 0.4:
                risk_level = 'High'
                message = 'High risk of progression to Alzheimer\'s Disease'
            else:
                risk_level = 'Moderate'
                message = 'Mild cognitive impairment detected, monitor closely'
        else:
            risk_level = 'Critical'
            message = 'Alzheimer\'s Disease diagnosis indicated'

        return {
            'level': risk_level,
            'message': message,
            'confidence_percentage': round(confidence * 100, 2)
        }

    def predict(self, patient_data_dict):
        """
        Takes a dictionary of patient biomarkers and returns the diagnosis.
        Accepts either minimal required fields or full feature set.
        """
        if patient_data_dict is None or not isinstance(patient_data_dict, dict):
            raise ValueError('patient_data_dict must be a dict')

        # Normalize + coerce values
        normalized = dict(patient_data_dict)

        # Map PTGENDER to numeric (training convention: Male=1, Female=0)
        if 'PTGENDER' in normalized:
            g = normalized.get('PTGENDER')
            if isinstance(g, str):
                gl = g.strip().lower()
                if gl in {'male', 'm'}:
                    normalized['PTGENDER'] = 1
                elif gl in {'female', 'f'}:
                    normalized['PTGENDER'] = 0
            if isinstance(normalized.get('PTGENDER'), str):
                normalized['PTGENDER'] = pd.to_numeric(normalized['PTGENDER'], errors='coerce')

        # Coerce numeric-like strings (leave known categoricals as-is so get_dummies works)
        for k, v in list(normalized.items()):
            if k in self._categorical_fields:
                continue
            if isinstance(v, str):
                vv = v.strip()
                if vv == '':
                    normalized.pop(k, None)
                    continue
                num = pd.to_numeric(vv, errors='coerce')
                if not pd.isna(num):
                    normalized[k] = float(num)

        # Convert dict to DataFrame
        df = pd.DataFrame([normalized])
        
        # Preprocess and Align
        X = self._preprocess(df)
        
        # Get numeric prediction and probabilities
        idx = int(self.model.predict(X)[0])
        probs = self.model.predict_proba(X)[0]
        
        # Map back to string label
        if self.le:
            label = self.le.inverse_transform([idx])[0]
        else:
            label = self.label_map.get(idx, str(idx))
        
        confidence = float(np.max(probs))

        probabilities = {
            "AD": round(float(probs[0]), 4),
            "CN": round(float(probs[1]), 4),
            "MCI": round(float(probs[2]), 4)
        }

        non_zero_features = int((X.iloc[0] != 0).sum())
        missing_features = int((X.iloc[0] == 0).sum())
        
        return {
            "prediction": label,
            "confidence": round(confidence, 4),
            "probabilities": probabilities,
            "risk_assessment": self._assess_risk(label, confidence, {
                'AD': float(probs[0]),
                'CN': float(probs[1]),
                'MCI': float(probs[2]),
            }),
            "meta": {
                "model": "phase3_8648",
                "preprocessor": "artifacts" if self.preprocessor is not None else "fallback_get_dummies",
                "expected_feature_count": len(self.model_features),
                "input_key_count": len(normalized.keys()),
                "non_zero_feature_count": non_zero_features,
                "zero_feature_count": missing_features,
            }
        }

    def predict_features(self, features_dict):
        """Predict using an already-expanded phase-3 feature vector.

        The caller provides feature names that match the model's training schema
        (i.e., the 8648 XGBoost feature names). Any missing features are filled
        with 0. Extra keys are ignored.
        """
        if features_dict is None or not isinstance(features_dict, dict):
            raise ValueError('features_dict must be a dict')

        model_feature_set = set(self.model_features)

        # Build a single-row vector aligned to model_features
        row = {}
        for k, v in features_dict.items():
            if k is None:
                continue
            key = str(k)
            # Keep only known model features to avoid accidental schema drift
            if key not in model_feature_set:
                continue

            if v is None:
                continue
            if isinstance(v, bool):
                row[key] = 1.0 if v else 0.0
                continue
            if isinstance(v, (int, float, np.number)):
                # NaNs become 0
                try:
                    fv = float(v)
                except Exception:
                    continue
                if np.isnan(fv):
                    continue
                row[key] = fv
                continue
            if isinstance(v, str):
                vv = v.strip()
                if vv == '':
                    continue
                num = pd.to_numeric(vv, errors='coerce')
                if pd.isna(num):
                    continue
                row[key] = float(num)

        X = pd.DataFrame([row]).reindex(columns=self.model_features, fill_value=0.0)

        idx = int(self.model.predict(X)[0])
        probs = self.model.predict_proba(X)[0]

        if self.le:
            label = self.le.inverse_transform([idx])[0]
        else:
            label = self.label_map.get(idx, str(idx))

        confidence = float(np.max(probs))
        probabilities = {
            "AD": round(float(probs[0]), 4),
            "CN": round(float(probs[1]), 4),
            "MCI": round(float(probs[2]), 4)
        }

        non_zero_features = int((X.iloc[0] != 0).sum())
        missing_features = int((X.iloc[0] == 0).sum())

        return {
            "prediction": label,
            "confidence": round(confidence, 4),
            "probabilities": probabilities,
            "risk_assessment": self._assess_risk(label, confidence, {
                'AD': float(probs[0]),
                'CN': float(probs[1]),
                'MCI': float(probs[2]),
            }),
            "meta": {
                "model": "phase3_8648",
                "preprocessor": "direct_features",
                "expected_feature_count": len(self.model_features),
                "input_key_count": len(features_dict.keys()),
                "non_zero_feature_count": non_zero_features,
                "zero_feature_count": missing_features,
            }
        }

# Initialize the predictor globally
# Update these paths to where you'll place the model files
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'best_adni_xgboost_model_phase_3.pkl')
ENCODER_PATH = os.path.join(os.path.dirname(__file__), 'models', 'label_encoder.pkl')

predictor = None

def get_predictor():
    global predictor
    if predictor is None:
        predictor = ADNIPredictor(MODEL_PATH, ENCODER_PATH)
    return predictor
