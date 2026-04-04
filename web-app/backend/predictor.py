import joblib
import pandas as pd
import re
import numpy as np
import os

class ADNIPredictor:
    def __init__(self, model_path, label_encoder_path=None):
        # 1. Load the trained XGBoost model
        self.model = joblib.load(model_path)
        
        # 2. Extract feature names the model was trained on
        self.model_features = self.model.get_booster().feature_names
        
        # 3. Load LabelEncoder to convert 0,1,2 back to AD, CN, MCI
        if label_encoder_path and os.path.exists(label_encoder_path):
            self.le = joblib.load(label_encoder_path)
        else:
            # Fallback mapping if no encoder available
            self.le = None
            self.label_map = {0: 'AD', 1: 'CN', 2: 'MCI'}

    def _preprocess(self, input_df):
        """Internal method to clean and align data."""
        # One-hot encode categoricals
        df_proc = pd.get_dummies(input_df)
        
        # Clean special characters (must match training exactly)
        df_proc.columns = [re.sub(r'[\[\]<>]', '_', str(col)) for col in df_proc.columns]
        
        # Reindex to ensure same column order and fill missing columns with 0
        df_proc = df_proc.reindex(columns=self.model_features, fill_value=0)
        return df_proc

    def predict(self, patient_data_dict):
        """
        Takes a dictionary of patient biomarkers and returns the diagnosis.
        Accepts either minimal required fields or full feature set.
        """
        # Convert dict to DataFrame
        df = pd.DataFrame([patient_data_dict])
        
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
        
        return {
            "prediction": label,
            "confidence": round(confidence, 4),
            "probabilities": {
                "AD": round(float(probs[0]), 4),
                "CN": round(float(probs[1]), 4),
                "MCI": round(float(probs[2]), 4)
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
