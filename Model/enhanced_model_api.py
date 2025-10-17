from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
import os
import sys

# Paths
# Allow overriding the model path with an environment variable for portability
MODEL_PATH = os.environ.get('MODEL_PATH')
DATASET_PATH = os.environ.get('DATASET_PATH', "alzheimers_disease_data.csv")

# If the dataset path isn't absolute or doesn't exist in cwd, try relative to this file
if not os.path.isabs(DATASET_PATH) and not os.path.exists(DATASET_PATH):
    candidate_dataset = os.path.join(os.path.dirname(__file__), DATASET_PATH)
    if os.path.exists(candidate_dataset):
        DATASET_PATH = candidate_dataset

# If MODEL_PATH not provided, try common relative locations or search for a .pkl in known dirs
if not MODEL_PATH:
    # common relative location used in project structure
    candidate = os.path.join(os.path.dirname(__file__), 'test_models', 'catboost_alzheimers_model.pkl')
    if os.path.exists(candidate):
        MODEL_PATH = candidate
    else:
        # search for any .pkl under Model/test_models or current Model directory
        search_dirs = [
            os.path.join(os.path.dirname(__file__), 'test_models'),
            os.path.dirname(__file__)
        ]
        found = None
        for d in search_dirs:
            try:
                if os.path.isdir(d):
                    for fname in os.listdir(d):
                        if fname.lower().endswith('.pkl'):
                            found = os.path.join(d, fname)
                            break
            except Exception:
                continue
            if found:
                break

        MODEL_PATH = found

# Load model
try:
    # Make sure the Model directory is importable so unpickling can find custom classes
    model_dir = os.path.dirname(__file__)
    if model_dir not in sys.path:
        sys.path.insert(0, model_dir)
    # Try import of local dummy_model (no-op if not present)
    try:
        import dummy_model  # noqa: F401
    except Exception:
        pass
    model = joblib.load(MODEL_PATH)
    print(f"✅ Model loaded successfully from {MODEL_PATH}")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None

# Load dataset
try:
    dataset = pd.read_csv(DATASET_PATH)
    print(f"✅ Dataset loaded successfully: {dataset.shape[0]} rows, {dataset.shape[1]} columns")
    print(f"📊 Dataset columns: {dataset.columns.tolist()}")
except Exception as e:
    print(f"❌ Error loading dataset: {e}")
    dataset = None

# Create app
app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "dataset_loaded": dataset is not None,
        "dataset_size": len(dataset) if dataset is not None else 0
    })

@app.route('/dataset-info', methods=['GET'])
def dataset_info():
    """Get dataset statistics and information"""
    if dataset is None:
        return jsonify({"error": "Dataset not loaded"}), 500
    
    try:
        # Basic statistics
        stats = {
            "total_patients": len(dataset),
            "columns": dataset.columns.tolist(),
            "data_types": dataset.dtypes.astype(str).to_dict(),
            "missing_values": dataset.isnull().sum().to_dict(),
            "basic_stats": dataset.describe().to_dict()
        }
        
        # If diagnosis column exists, get distribution
        if 'Diagnosis' in dataset.columns:
            stats["diagnosis_distribution"] = dataset['Diagnosis'].value_counts().to_dict()
        
        return jsonify({
            "success": True,
            "data": stats
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/predict-enhanced', methods=['POST'])
def predict_enhanced():
    """
    Enhanced prediction with dataset context and detailed analysis
    Expected JSON format:
    {
        "age": 75,
        "gender": 1,
        "education": 16,
        "apoe4": 1,
        "mmse": 24,
        "cdr": 0.5
    }
    """
    try:
        if model is None:
            return jsonify({
                "error": "Model not loaded"
            }), 500
        
        if dataset is None:
            return jsonify({
                "error": "Dataset not loaded"
            }), 500

        data = request.json
        if not data:
            return jsonify({
                "error": "No data provided"
            }), 400

        # Convert to DataFrame for prediction
        input_df = pd.DataFrame([data])
        
        # Make prediction
        proba = model.predict_proba(input_df)[:, 1][0]
        prediction = int(proba > 0.5)
        
        # Risk level classification
        if proba < 0.3:
            risk_level = "Low Risk"
            risk_color = "green"
        elif proba < 0.7:
            risk_level = "Moderate Risk"
            risk_color = "orange"
        else:
            risk_level = "High Risk"
            risk_color = "red"
        
        # Dataset-based analysis
        dataset_analysis = analyze_against_dataset(data, dataset, prediction)
        
        # Recommendations based on risk
        recommendations = generate_recommendations(data, proba, dataset_analysis)
        
        return jsonify({
            "success": True,
            "prediction": {
                "result": prediction,
                "probability": float(proba),
                "probability_percentage": float(proba * 100),
                "risk_level": risk_level,
                "risk_color": risk_color,
                "diagnosis": "Alzheimer's Disease" if prediction == 1 else "Healthy"
            },
            "dataset_analysis": dataset_analysis,
            "recommendations": recommendations,
            "input_data": data
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Error during enhanced prediction"
        }), 500

def analyze_against_dataset(input_data, dataset, prediction):
    """Analyze input against the dataset to provide context"""
    try:
        analysis = {}
        
        # Total patients in dataset
        analysis["total_patients_in_dataset"] = len(dataset)
        
        # Age analysis
        if 'Age' in dataset.columns and 'age' in input_data:
            user_age = input_data['age']
            age_percentile = (dataset['Age'] < user_age).sum() / len(dataset) * 100
            analysis["age_comparison"] = {
                "user_age": user_age,
                "dataset_mean_age": float(dataset['Age'].mean()),
                "dataset_median_age": float(dataset['Age'].median()),
                "dataset_min_age": float(dataset['Age'].min()),
                "dataset_max_age": float(dataset['Age'].max()),
                "percentile": float(age_percentile),
                "interpretation": f"Your age is in the {age_percentile:.1f}th percentile of the dataset"
            }
        
        # MMSE analysis
        if 'MMSE' in dataset.columns and 'mmse' in input_data:
            user_mmse = input_data['mmse']
            mmse_percentile = (dataset['MMSE'] > user_mmse).sum() / len(dataset) * 100
            analysis["mmse_comparison"] = {
                "user_mmse": user_mmse,
                "dataset_mean_mmse": float(dataset['MMSE'].mean()),
                "dataset_median_mmse": float(dataset['MMSE'].median()),
                "dataset_min_mmse": float(dataset['MMSE'].min()),
                "dataset_max_mmse": float(dataset['MMSE'].max()),
                "percentile": float(100 - mmse_percentile),
                "interpretation": f"Your MMSE score is better than {100 - mmse_percentile:.1f}% of patients in the dataset"
            }
        
        # Education Level analysis
        if 'EducationLevel' in dataset.columns and 'education' in input_data:
            user_education = input_data['education']
            analysis["education_comparison"] = {
                "user_education": user_education,
                "dataset_mean_education": float(dataset['EducationLevel'].mean()),
                "interpretation": f"Education level: {user_education} years"
            }
        
        # Similar patients analysis
        similar_patients = find_similar_patients(input_data, dataset, top_n=20)
        analysis["similar_patients"] = similar_patients
        
        # Risk distribution in dataset
        if 'Diagnosis' in dataset.columns:
            total_patients = len(dataset)
            diagnosis_counts = dataset['Diagnosis'].value_counts().to_dict()
            healthy_count = diagnosis_counts.get(0, 0)
            alzheimers_count = diagnosis_counts.get(1, 0)
            
            analysis["dataset_risk_distribution"] = {
                "total_patients": total_patients,
                "healthy": healthy_count,
                "alzheimers": alzheimers_count,
                "healthy_percentage": float((healthy_count / total_patients) * 100),
                "alzheimers_percentage": float((alzheimers_count / total_patients) * 100)
            }
        
        return analysis
        
    except Exception as e:
        return {"error": f"Error in dataset analysis: {str(e)}"}

def find_similar_patients(input_data, dataset, top_n=20):
    """Find similar patients in the dataset"""
    try:
        # Calculate similarity based on key features available in dataset
        features_to_compare = ['Age', 'MMSE']
        input_features = {
            'Age': input_data.get('age', 0),
            'MMSE': input_data.get('mmse', 0)
        }
        
        # Calculate Euclidean distance
        distances = []
        for idx, row in dataset.iterrows():
            dist = 0
            for feature in features_to_compare:
                if feature in dataset.columns:
                    dataset_val = row[feature]
                    input_val = input_features.get(feature, 0)
                    # Normalize by feature range to give equal weight
                    feature_range = dataset[feature].max() - dataset[feature].min()
                    if feature_range > 0:
                        normalized_diff = (dataset_val - input_val) / feature_range
                        dist += normalized_diff ** 2
            distances.append((idx, np.sqrt(dist)))
        
        # Sort by distance and get top N
        distances.sort(key=lambda x: x[1])
        similar_indices = [idx for idx, _ in distances[:top_n]]
        
        # Get diagnosis distribution of similar patients
        if 'Diagnosis' in dataset.columns:
            similar_diagnoses_raw = dataset.loc[similar_indices, 'Diagnosis'].value_counts().to_dict()
            # Convert to readable format
            similar_diagnoses = {
                "Healthy": similar_diagnoses_raw.get(0, 0),
                "Alzheimer's Disease": similar_diagnoses_raw.get(1, 0)
            }
            
            total_similar = len(similar_indices)
            return {
                "count": total_similar,
                "diagnosis_distribution": similar_diagnoses,
                "healthy_percentage": float((similar_diagnoses["Healthy"] / total_similar) * 100),
                "alzheimers_percentage": float((similar_diagnoses["Alzheimer's Disease"] / total_similar) * 100),
                "interpretation": f"Among {total_similar} most similar patients in the dataset"
            }
        
        return {"count": len(similar_indices)}
        
    except Exception as e:
        return {"error": f"Error finding similar patients: {str(e)}"}

def generate_recommendations(input_data, probability, dataset_analysis):
    """Generate personalized recommendations based on prediction and dataset analysis"""
    recommendations = []
    
    # Risk-based recommendations
    if probability > 0.7:
        recommendations.append({
            "category": "Urgent",
            "title": "Immediate Medical Consultation",
            "description": "High risk detected. Please consult with a neurologist as soon as possible for comprehensive evaluation."
        })
    elif probability > 0.4:
        recommendations.append({
            "category": "Important",
            "title": "Schedule Medical Checkup",
            "description": "Moderate risk detected. Schedule a checkup with your healthcare provider for further assessment."
        })
    else:
        recommendations.append({
            "category": "Preventive",
            "title": "Maintain Healthy Lifestyle",
            "description": "Low risk detected. Continue with regular health monitoring and maintain a healthy lifestyle."
        })
    
    # MMSE-based recommendations
    if 'mmse' in input_data:
        mmse = input_data['mmse']
        if mmse < 24:
            recommendations.append({
                "category": "Cognitive Health",
                "title": "Cognitive Training",
                "description": "Your MMSE score suggests cognitive training exercises may be beneficial. Consider memory games, puzzles, and learning new skills."
            })
    
    # General recommendations
    recommendations.extend([
        {
            "category": "Lifestyle",
            "title": "Physical Activity",
            "description": "Regular physical exercise (30 minutes daily) can help maintain cognitive function."
        },
        {
            "category": "Diet",
            "title": "Mediterranean Diet",
            "description": "A diet rich in fruits, vegetables, whole grains, and omega-3 fatty acids supports brain health."
        },
        {
            "category": "Social",
            "title": "Social Engagement",
            "description": "Stay socially active and maintain regular interactions with family and friends."
        }
    ])
    
    return recommendations

@app.route('/predict', methods=['POST'])
def predict():
    """
    Standard prediction endpoint (backward compatible)
    """
    try:
        if model is None:
            return jsonify({
                "error": "Model not loaded"
            }), 500

        data = request.json
        if not data:
            return jsonify({
                "error": "No data provided"
            }), 400

        # Convert to DataFrame
        df = pd.DataFrame([data])

        # Predict
        proba = model.predict_proba(df)[:, 1][0]
        prediction = int(proba > 0.5)
        
        # Risk level
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
            "error": str(e)
        }), 500

@app.route('/model-info', methods=['GET'])
def model_info():
    """Get information about the model"""
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500
    
    try:
        return jsonify({
            "model_type": str(type(model).__name__),
            "features": list(model.feature_names_) if hasattr(model, 'feature_names_') else "Not available",
            "n_features": model.n_features_ if hasattr(model, 'n_features_') else "Not available"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 Starting Enhanced Alzheimer's Prediction API...")
    print("=" * 60)
    print(f"📍 Model path: {MODEL_PATH}")
    print(f"📊 Dataset path: {DATASET_PATH}")
    print(f"🌐 API will run on http://localhost:5001")
    print(f"\n📝 Endpoints:")
    print(f"   - GET  /health              - Health check")
    print(f"   - GET  /dataset-info        - Dataset statistics")
    print(f"   - POST /predict             - Standard prediction")
    print(f"   - POST /predict-enhanced    - Enhanced prediction with dataset analysis")
    print(f"   - GET  /model-info          - Model information")
    print("=" * 60)
    
    # Run on port 5001
    app.run(host='0.0.0.0', port=5001, debug=True)
