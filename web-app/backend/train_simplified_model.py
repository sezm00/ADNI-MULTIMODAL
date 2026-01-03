"""
Simplified Model Training Script
Train an XGBoost model using only the features available in your web application

This will create a model that works accurately with your actual input data instead
of requiring 8648 features.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import xgboost as xgb
import joblib
import os

# Features that your web app actually collects
# Modify this list based on what data you can actually provide
AVAILABLE_FEATURES = [
    'AGE',
    'PTGENDER',  # 0 = Female, 1 = Male
    'PTEDUCAT',  # Years of education
    'MMSE',  # Mini-Mental State Examination score
    'Hippocampus',  # Hippocampus volume
    'WholeBrain',  # Whole brain volume
    'Entorhinal',  # Entorhinal cortex volume
    'MidTemp',  # Middle temporal gyrus volume
    'APOE4',  # APOE4 genotype (0, 1, or 2 alleles)
]

TARGET_COLUMN = 'DX_CLEAN'  # Diagnosis: AD, CN, or MCI

def load_and_prepare_data(data_path):
    """
    Load the ADNI dataset and select only the features we actually use
    """
    print(f"Loading data from {data_path}...")
    
    # Try to load the merged ADNI dataset
    if not os.path.exists(data_path):
        print(f"❌ Error: Data file not found at {data_path}")
        print("\nPlease provide the path to your preprocessed ADNI data.")
        print("Options:")
        print("  1. Use merged_adni_raw.csv from preprocessing")
        print("  2. Use the original ADNIMERGE file")
        return None, None, None, None
    
    df = pd.read_csv(data_path, low_memory=False)
    print(f"✅ Loaded {len(df)} rows, {len(df.columns)} columns")
    
    # Check which features are available
    missing_features = [f for f in AVAILABLE_FEATURES if f not in df.columns]
    if missing_features:
        print(f"\n⚠️  Warning: Missing features: {missing_features}")
        print("Available columns:", df.columns.tolist()[:20], "...")
        
        # Try to find similar column names
        for missing in missing_features:
            similar = [col for col in df.columns if missing.lower() in col.lower()]
            if similar:
                print(f"  → Possible match for {missing}: {similar}")
    
    # Check if target column exists
    if TARGET_COLUMN not in df.columns:
        print(f"\n❌ Error: Target column '{TARGET_COLUMN}' not found")
        # Try to find diagnosis column
        diag_cols = [col for col in df.columns if 'dx' in col.lower() or 'diag' in col.lower()]
        print(f"Available diagnosis columns: {diag_cols}")
        return None, None, None, None
    
    # Keep only rows with diagnosis and required features
    df = df.dropna(subset=[TARGET_COLUMN])
    
    # Select only available features
    features_to_use = [f for f in AVAILABLE_FEATURES if f in df.columns]
    print(f"\nUsing {len(features_to_use)} features: {features_to_use}")
    
    # Create X and y
    X = df[features_to_use].copy()
    y = df[TARGET_COLUMN].copy()
    
    # Drop rows with missing values in features
    mask = X.notna().all(axis=1)
    X = X[mask]
    y = y[mask]
    
    print(f"✅ Final dataset: {len(X)} samples with {len(features_to_use)} features")
    print(f"   Diagnosis distribution:\n{y.value_counts()}")
    
    return X, y, features_to_use

def train_simple_model(X_train, X_val, y_train, y_val, feature_names):
    """
    Train a simplified XGBoost model
    """
    print("\n" + "="*60)
    print("Training XGBoost Model")
    print("="*60)
    
    # Encode labels
    le = LabelEncoder()
    y_train_encoded = le.fit_transform(y_train.astype(str))
    y_val_encoded = le.transform(y_val.astype(str))
    
    print(f"Label mapping: {dict(zip(le.classes_, range(len(le.classes_))))}")
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    
    # Train XGBoost
    model = xgb.XGBClassifier(
        n_estimators=500,
        learning_rate=0.05,
        max_depth=5,
        eval_metric='mlogloss',
        random_state=42,
        early_stopping_rounds=20
    )
    
    print("\nTraining model...")
    model.fit(
        X_train_scaled, y_train_encoded,
        eval_set=[(X_val_scaled, y_val_encoded)],
        verbose=50
    )
    
    # Evaluate
    train_pred = model.predict(X_train_scaled)
    val_pred = model.predict(X_val_scaled)
    
    train_acc = accuracy_score(y_train_encoded, train_pred)
    val_acc = accuracy_score(y_val_encoded, val_pred)
    
    print(f"\n✅ Training Accuracy: {train_acc:.4f}")
    print(f"✅ Validation Accuracy: {val_acc:.4f}")
    
    print("\nValidation Classification Report:")
    print(classification_report(y_val_encoded, val_pred, target_names=le.classes_))
    
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_val_encoded, val_pred))
    
    return model, scaler, le

def save_model_artifacts(model, scaler, le, feature_names, output_dir):
    """
    Save the trained model and preprocessing artifacts
    """
    os.makedirs(output_dir, exist_ok=True)
    
    # Save model
    model_path = os.path.join(output_dir, 'simplified_adni_model.pkl')
    joblib.dump(model, model_path)
    print(f"\n✅ Saved model to: {model_path}")
    
    # Save scaler
    scaler_path = os.path.join(output_dir, 'feature_scaler.pkl')
    joblib.dump(scaler, scaler_path)
    print(f"✅ Saved scaler to: {scaler_path}")
    
    # Save label encoder
    le_path = os.path.join(output_dir, 'label_encoder.pkl')
    joblib.dump(le, le_path)
    print(f"✅ Saved label encoder to: {le_path}")
    
    # Save feature names
    features_path = os.path.join(output_dir, 'feature_names.pkl')
    joblib.dump(feature_names, features_path)
    print(f"✅ Saved feature names to: {features_path}")
    
    # Create a summary file
    summary_path = os.path.join(output_dir, 'model_info.txt')
    with open(summary_path, 'w') as f:
        f.write("Simplified ADNI Model Information\n")
        f.write("="*50 + "\n\n")
        f.write(f"Features ({len(feature_names)}):\n")
        for i, feat in enumerate(feature_names, 1):
            f.write(f"  {i}. {feat}\n")
        f.write(f"\nDiagnosis Classes: {list(le.classes_)}\n")
        f.write(f"\nLabel Encoding: {dict(zip(le.classes_, range(len(le.classes_))))}\n")
    
    print(f"✅ Saved model info to: {summary_path}")

def main():
    """
    Main training pipeline
    """
    print("="*60)
    print("Simplified ADNI Model Training")
    print("="*60)
    
    # Configure paths
    # UPDATE THIS PATH to point to your preprocessed ADNI data
    data_path = input("\nEnter path to your ADNI data CSV (or press Enter for default): ").strip()
    if not data_path:
        # Try default locations
        possible_paths = [
            "../../Main/notebooks/merged_adni_raw.csv",
            "merged_adni_raw.csv",
            "ADNIMERGE_10Nov2025.csv"
        ]
        for path in possible_paths:
            if os.path.exists(path):
                data_path = path
                print(f"Using: {data_path}")
                break
    
    if not data_path or not os.path.exists(data_path):
        print("\n❌ No valid data file found. Please provide the path manually.")
        return
    
    # Load data
    X, y, feature_names = load_and_prepare_data(data_path)
    
    if X is None:
        return
    
    # Split data
    print("\nSplitting data (70% train, 15% val, 15% test)...")
    X_temp, X_test, y_temp, y_test = train_test_split(
        X, y, test_size=0.15, random_state=42, stratify=y
    )
    X_train, X_val, y_train, y_val = train_test_split(
        X_temp, y_temp, test_size=0.176, random_state=42, stratify=y_temp
    )  # 0.176 of 0.85 ≈ 0.15 of total
    
    print(f"Train: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}")
    
    # Train model
    model, scaler, le = train_simple_model(X_train, X_val, y_train, y_val, feature_names)
    
    # Test on held-out test set
    print("\n" + "="*60)
    print("Final Test Set Evaluation")
    print("="*60)
    X_test_scaled = scaler.transform(X_test)
    y_test_encoded = le.transform(y_test.astype(str))
    test_pred = model.predict(X_test_scaled)
    test_acc = accuracy_score(y_test_encoded, test_pred)
    
    print(f"✅ Test Accuracy: {test_acc:.4f}")
    print("\nTest Classification Report:")
    print(classification_report(y_test_encoded, test_pred, target_names=le.classes_))
    
    # Save everything
    output_dir = "models"
    save_model_artifacts(model, scaler, le, feature_names, output_dir)
    
    print("\n" + "="*60)
    print("Training Complete!")
    print("="*60)
    print(f"\nNext steps:")
    print(f"1. Update adni_predictor.py to use the new model")
    print(f"2. Test with: python test_predictor.py")
    print(f"3. Deploy to production")

if __name__ == "__main__":
    main()
