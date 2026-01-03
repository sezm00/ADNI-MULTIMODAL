"""
Simplified ADNI Predictor - Works with Web App Features
Uses the simplified model trained on actual app features
"""
import joblib
import pandas as pd
import numpy as np
import os

class SimplifiedADNIPredictor:
    """
    Predictor using simplified model with 9 features
    """
    
    def __init__(self, model_path, scaler_path, label_encoder_path, features_path):
        """
        Initialize with model and preprocessing artifacts
        """
        self.model = joblib.load(model_path)
        self.scaler = joblib.load(scaler_path)
        self.label_encoder = joblib.load(label_encoder_path)
        self.expected_features = joblib.load(features_path)
    
    def predict(self, patient_data):
        """
        Make prediction for a patient
        
        Args:
            patient_data: Dictionary containing patient features
        
        Returns:
            Dictionary with prediction, probabilities, and risk assessment
        """
        try:
            if patient_data is None or not isinstance(patient_data, dict):
                raise ValueError('patient_data must be a dict')

            # Work on a copy so we don't mutate caller state
            patient_data = dict(patient_data)

            # Convert gender to numeric (training convention: Male=1, Female=0)
            if 'PTGENDER' in patient_data:
                g = patient_data['PTGENDER']
                if isinstance(g, str):
                    gl = g.strip().lower()
                    if gl in {'male', 'm'}:
                        patient_data['PTGENDER'] = 1
                    elif gl in {'female', 'f'}:
                        patient_data['PTGENDER'] = 0
                # Allow numeric strings like "0"/"1"
                if isinstance(patient_data.get('PTGENDER'), str):
                    patient_data['PTGENDER'] = pd.to_numeric(patient_data['PTGENDER'], errors='coerce')

            # Create DataFrame from incoming data (may include many extra fields)
            df = pd.DataFrame([patient_data])

            ignored_fields = [k for k in patient_data.keys() if k not in set(self.expected_features)]
            filled_defaults = []
            
            # Ensure all expected features are present, fill missing with reasonable defaults
            for feature in self.expected_features:
                if feature not in df.columns:
                    # Set default values based on feature type
                    if feature == 'AGE':
                        df[feature] = 70.0  # Average age
                    elif feature == 'PTGENDER':
                        df[feature] = 1  # Default male
                    elif feature == 'PTEDUCAT':
                        df[feature] = 16  # Average education
                    elif feature == 'MMSE':
                        df[feature] = 25.0  # Borderline score
                    elif feature == 'Hippocampus':
                        df[feature] = 7500.0  # Average volume
                    elif feature == 'WholeBrain':
                        df[feature] = 1100000.0
                    elif feature == 'Entorhinal':
                        df[feature] = 3300.0
                    elif feature == 'MidTemp':
                        df[feature] = 19000.0
                    elif feature == 'APOE4':
                        df[feature] = 0  # No genetic risk
                    filled_defaults.append(feature)

            # Coerce expected features to numeric; if invalid, fall back to defaults
            for feature in self.expected_features:
                df[feature] = pd.to_numeric(df[feature], errors='coerce')
                if df[feature].isna().any():
                    if feature == 'AGE':
                        df[feature] = df[feature].fillna(70.0)
                    elif feature == 'PTGENDER':
                        df[feature] = df[feature].fillna(1)
                    elif feature == 'PTEDUCAT':
                        df[feature] = df[feature].fillna(16)
                    elif feature == 'MMSE':
                        df[feature] = df[feature].fillna(25.0)
                    elif feature == 'Hippocampus':
                        df[feature] = df[feature].fillna(7500.0)
                    elif feature == 'WholeBrain':
                        df[feature] = df[feature].fillna(1100000.0)
                    elif feature == 'Entorhinal':
                        df[feature] = df[feature].fillna(3300.0)
                    elif feature == 'MidTemp':
                        df[feature] = df[feature].fillna(19000.0)
                    elif feature == 'APOE4':
                        df[feature] = df[feature].fillna(0)
                    if feature not in filled_defaults:
                        filled_defaults.append(feature)
            
            # Select features in correct order (keep DataFrame to preserve feature names)
            X_df = df[self.expected_features]
            
            # Scale features
            X_scaled = self.scaler.transform(X_df)
            
            # Make prediction
            pred_encoded = self.model.predict(X_scaled)[0]
            proba = self.model.predict_proba(X_scaled)[0]
            
            # Decode prediction
            prediction = self.label_encoder.inverse_transform([pred_encoded])[0]
            
            # Get confidence
            confidence = float(np.max(proba))
            
            # Create probability dictionary
            probabilities = {}
            for i, label in enumerate(self.label_encoder.classes_):
                probabilities[label] = float(proba[i])
            
            return {
                'prediction': prediction,
                'confidence': round(confidence, 4),
                'probabilities': {k: round(v, 4) for k, v in probabilities.items()},
                'risk_assessment': self._assess_risk(prediction, confidence, probabilities),
                'meta': {
                    'used_features': list(self.expected_features),
                    'ignored_fields': ignored_fields,
                    'filled_defaults': sorted(set(filled_defaults)),
                }
            }
            
        except Exception as e:
            raise Exception(f"Prediction error: {str(e)}")
    
    def _assess_risk(self, prediction, confidence, probabilities):
        """
        Provide risk assessment based on prediction and probabilities
        """
        if prediction == 'CN':
            if probabilities.get('MCI', 0) > 0.3 or probabilities.get('AD', 0) > 0.2:
                risk_level = 'Moderate'
                message = 'Patient shows some risk indicators for cognitive decline'
            else:
                risk_level = 'Low'
                message = 'Patient appears cognitively normal with low risk'
        elif prediction == 'MCI':
            if probabilities.get('AD', 0) > 0.4:
                risk_level = 'High'
                message = 'High risk of progression to Alzheimer\'s Disease'
            else:
                risk_level = 'Moderate'
                message = 'Mild cognitive impairment detected, monitor closely'
        else:  # AD
            risk_level = 'Critical'
            message = 'Alzheimer\'s Disease diagnosis indicated'
        
        return {
            'level': risk_level,
            'message': message,
            'confidence_percentage': round(confidence * 100, 2)
        }

# Global predictor instance
_predictor_instance = None

def get_predictor():
    """
    Get or create singleton predictor instance
    """
    global _predictor_instance
    
    if _predictor_instance is None:
        # Determine paths
        base_dir = os.path.dirname(__file__)
        models_dir = os.path.join(base_dir, 'models')
        
        model_path = os.path.join(models_dir, 'simplified_xgboost_model.pkl')
        scaler_path = os.path.join(models_dir, 'simplified_scaler.pkl')
        le_path = os.path.join(models_dir, 'simplified_label_encoder.pkl')
        features_path = os.path.join(models_dir, 'simplified_features.pkl')
        
        # Check if files exist
        if not all(os.path.exists(p) for p in [model_path, scaler_path, le_path, features_path]):
            raise FileNotFoundError(
                "Simplified model files not found. Please run train_model_quick.py first."
            )
        
        _predictor_instance = SimplifiedADNIPredictor(
            model_path, scaler_path, le_path, features_path
        )
    
    return _predictor_instance

if __name__ == "__main__":
    # Test the predictor
    test_data = {
        'AGE': 75.0,
        'PTGENDER': 1,
        'PTEDUCAT': 16,
        'MMSE': 24.0,
        'Hippocampus': 7500.0,
        'WholeBrain': 1100000.0,
        'Entorhinal': 3400.0,
        'MidTemp': 19000.0,
        'APOE4': 1
    }
    
    predictor = get_predictor()
    result = predictor.predict(test_data)
    
    print("\n=== Prediction Result ===")
    print(f"Diagnosis: {result['prediction']}")
    print(f"Confidence: {result['confidence']}")
    print(f"Probabilities: {result['probabilities']}")
    print(f"Risk Assessment: {result['risk_assessment']}")
