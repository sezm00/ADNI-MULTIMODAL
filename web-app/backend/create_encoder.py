"""
Script to create a label encoder for the ADNI model
Run this once to generate the label_encoder.pkl file
"""
import joblib
from sklearn.preprocessing import LabelEncoder

# Create label encoder with the three classes
le = LabelEncoder()
le.fit(['AD', 'CN', 'MCI'])

# Save the encoder
joblib.dump(le, 'models/label_encoder.pkl')

print("✅ Label encoder created successfully!")
print(f"Classes: {le.classes_}")
print(f"AD -> {le.transform(['AD'])[0]}")
print(f"CN -> {le.transform(['CN'])[0]}")
print(f"MCI -> {le.transform(['MCI'])[0]}")
