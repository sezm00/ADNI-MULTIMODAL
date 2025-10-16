from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os

# Load model
model_path = r"E:\University\Year_3\Grad\ADNI_MULTIMODAL\Model\test_models\catboost_alzheimers_model.pkl"

try:
    model = joblib.load(model_path)
    print(f"✅ Model loaded successfully from {model_path}")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None

# Create app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None
    })

@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict Alzheimer's risk based on input features
    Expected JSON format:
    {
        "age": 75,
        "gender": 1,
        "education": 16,
        "apoe4": 1,
        "mmse": 24,
        "cdr": 0.5,
        ... (other features required by your model)
    }
    """
    try:
        if model is None:
            return jsonify({
                "error": "Model not loaded",
                "message": "Please check the model path"
            }), 500

        data = request.json  # Receive JSON from Node.js
        
        if not data:
            return jsonify({
                "error": "No data provided",
                "message": "Please provide input features"
            }), 400

        # Convert to DataFrame
        df = pd.DataFrame([data])

        # Predict probability and class
        proba = model.predict_proba(df)[:, 1][0]
        prediction = int(proba > 0.5)
        
        # Assign risk level
        if proba < 0.3:
            risk = "Low Risk"
            risk_color = "green"
        elif proba < 0.7:
            risk = "Moderate Risk"
            risk_color = "orange"
        else:
            risk = "High Risk"
            risk_color = "red"

        return jsonify({
            "success": True,
            "prediction": prediction,
            "probability": float(proba),
            "probability_percentage": float(proba * 100),
            "risk_level": risk,
            "risk_color": risk_color,
            "diagnosis": "Alzheimer's Disease" if prediction == 1 else "Healthy"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Error during prediction"
        }), 500

@app.route('/model-info', methods=['GET'])
def model_info():
    """Get information about the model"""
    if model is None:
        return jsonify({
            "error": "Model not loaded"
        }), 500
    
    try:
        return jsonify({
            "model_type": str(type(model).__name__),
            "features": list(model.feature_names_) if hasattr(model, 'feature_names_') else "Not available",
            "n_features": model.n_features_ if hasattr(model, 'n_features_') else "Not available"
        })
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

if __name__ == '__main__':
    print("🚀 Starting Alzheimer's Prediction API...")
    print(f"📍 Model path: {model_path}")
    print(f"🌐 API will run on http://localhost:5001")
    print(f"📝 Endpoints:")
    print(f"   - GET  /health      - Health check")
    print(f"   - POST /predict     - Make prediction")
    print(f"   - GET  /model-info  - Get model information")
    
    # Run on port 5001 to avoid conflict with Node.js backend on port 5000
    app.run(host='0.0.0.0', port=5001, debug=True)
