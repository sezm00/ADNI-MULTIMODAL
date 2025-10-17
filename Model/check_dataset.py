import pandas as pd

# Load the dataset
df = pd.read_csv('alzheimers_disease_data.csv')

print("=" * 60)
print("DATASET INFORMATION")
print("=" * 60)
print(f"\nColumns: {df.columns.tolist()}")
print(f"\nDataset shape: {df.shape}")
print(f"Total rows: {df.shape[0]}")
print(f"Total columns: {df.shape[1]}")

print("\n" + "=" * 60)
print("FIRST 5 ROWS")
print("=" * 60)
print(df.head())

print("\n" + "=" * 60)
print("DATA TYPES")
print("=" * 60)
print(df.dtypes)

print("\n" + "=" * 60)
print("BASIC STATISTICS")
print("=" * 60)
print(df.describe())

print("\n" + "=" * 60)
print("MISSING VALUES")
print("=" * 60)
print(df.isnull().sum())
