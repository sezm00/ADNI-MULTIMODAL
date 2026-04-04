from flask import Flask, request, jsonify
import joblib
import pandas as pd

# Load model
model = joblib.load(r"E:\University\Year_3\Grad\ADNI_MULTIMODAL\Model\test_models\catboost_alzheimers_model.pkl")

# Create app
app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json  # Receive JSON from Node.js
    df = pd.DataFrame([data])  # Convert to DataFrame

    # Predict probability and class
    proba = model.predict_proba(df)[:, 1][0]
    prediction = int(proba > 0.5)
    
    # Assign risk level
    if proba < 0.3:
        risk = "Low Risk"
    elif proba < 0.7:
        risk = "Moderate Risk"
    else:
        risk = "High Risk"

    return jsonify({
        "prediction": prediction,
        "probability": float(proba),
        "risk_level": risk
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True)
# To run the app, use the command: python test_model_api.py