"""
Enhanced ADNI Predictor with Proper Preprocessing Pipeline
This module handles the complete prediction pipeline matching the training process
"""
import joblib
import pandas as pd
import numpy as np
import re
import os
from sklearn.preprocessing import StandardScaler, LabelEncoder

class ADNIPredictor:
    """
    Advanced predictor that properly preprocesses input data to match
    the training pipeline used for the XGBoost model
    """
    
    def __init__(self, model_path, feature_columns_path=None):
        """
        Initialize the predictor with model and preprocessing artifacts
        
        Args:
            model_path: Path to the trained XGBoost model (.pkl)
            feature_columns_path: Path to saved feature columns from training (optional)
        """
        print(f"Loading model from: {model_path}")
        self.model = joblib.load(model_path)
        
        # Get feature names from the model
        if hasattr(self.model, 'feature_names_in_'):
            self.expected_features = list(self.model.feature_names_in_)
        elif hasattr(self.model, 'get_booster'):
            self.expected_features = self.model.get_booster().feature_names
        else:
            raise ValueError("Cannot extract feature names from model")
        
        print(f"Model expects {len(self.expected_features)} features")
        
        # Initialize label encoder for diagnosis classes
        self.label_encoder = LabelEncoder()
        self.label_encoder.classes_ = np.array(['AD', 'CN', 'MCI'])  # Based on ADNI standard classes
        
        # Initialize scaler (will be fitted on first prediction if needed)
        self.scaler = StandardScaler()
        self.scaler_fitted = False
    
    def _clean_feature_names(self, df):
        """
        Clean feature names to match training preprocessing
        Replaces special characters that cause issues
        """
        df.columns = [re.sub(r'[\[\]<>]', '_', str(col)) for col in df.columns]
        return df
    
    def _preprocess_input(self, patient_data):
        """
        Preprocess input data to match the training pipeline:
        1. Convert to DataFrame
        2. Handle categorical encoding (one-hot)
        3. Align features with training data
        4. Clean feature names
        5. Fill missing columns with 0
        
        Args:
            patient_data: Dictionary of patient features
            
        Returns:
            Preprocessed DataFrame ready for prediction
        """
        # Convert to DataFrame
        df = pd.DataFrame([patient_data])
        
        # Apply one-hot encoding for categorical columns
        # This creates dummy variables for any string/categorical columns
        df = pd.get_dummies(df)
        
        # Clean feature names (replace special characters)
        df = self._clean_feature_names(df)
        
        # Efficiently align with expected features using reindex
        # This adds missing columns with 0 and keeps only expected features in correct order
        df = df.reindex(columns=self.expected_features, fill_value=0)
        
        return df
    
    def predict(self, patient_data):
        """
        Make prediction for a patient
        
        Args:
            patient_data: Dictionary containing patient features
                         Can include any subset of ADNI features
        
        Returns:
            Dictionary with prediction, probabilities, and confidence
        """
        try:
            # Preprocess the input
            X = self._preprocess_input(patient_data)
            
            # Make prediction
            pred_encoded = self.model.predict(X)[0]
            proba = self.model.predict_proba(X)[0]
            
            # Decode prediction to class label
            prediction = self.label_encoder.inverse_transform([pred_encoded])[0]
            
            # Get confidence (highest probability)
            confidence = float(np.max(proba))
            
            # Create probability dictionary for all classes
            probabilities = {
                'AD': float(proba[0]),
                'CN': float(proba[1]),
                'MCI': float(proba[2])
            }
            
            return {
                'prediction': prediction,
                'confidence': round(confidence, 4),
                'probabilities': {k: round(v, 4) for k, v in probabilities.items()},
                'risk_assessment': self._assess_risk(prediction, confidence, probabilities)
            }
            
        except Exception as e:
            raise Exception(f"Prediction error: {str(e)}")
    
    def _assess_risk(self, prediction, confidence, probabilities):
        """
        Provide risk assessment based on prediction and probabilities
        """
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
        # Determine model path
        model_path = os.path.join(
            os.path.dirname(__file__), 
            'models', 
            'best_adni_xgboost_model_phase_3.pkl'
        )
        
        if not os.path.exists(model_path):
            # Try alternative path in Main/outputs
            alt_path = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
                'Main', 'outputs', 'models', 'best_adni_xgboost_model_phase_3.pkl'
            )
            if os.path.exists(alt_path):
                model_path = alt_path
            else:
                raise FileNotFoundError(f"Model not found at {model_path} or {alt_path}")
        
        print(f"Initializing predictor with model: {model_path}")
        _predictor_instance = ADNIPredictor(model_path)
    
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
        'MidTemp': 19000.0
    }
    
    predictor = get_predictor()
    result = predictor.predict(test_data)
    
    print("\n=== Prediction Result ===")
    print(f"Diagnosis: {result['prediction']}")
    print(f"Confidence: {result['confidence']}")
    print(f"Probabilities: {result['probabilities']}")
    print(f"Risk Assessment: {result['risk_assessment']}")
