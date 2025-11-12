
# Preprocessing Pipeline for ADNI / Dementia / Diagnostic Datasets

This document explains the preprocessing steps applied to the datasets in this project.

## 1️⃣ Columns Dropped
Certain columns that are either redundant, metadata, or administrative IDs were dropped:
- `RID`, `VISCODE`, `PTID` were temporarily dropped during numeric processing and reattached later.
- Other metadata and date columns such as `PHASE`, `VISCODE2`, `EXAMDATE`, `USERDATE`, `USERDATE2`, `DD_CRF_VERSION_LABEL`, `LANGUAGE_CODE`, `update_stamp`, `ID`, `SITEID` were removed to reduce noise.

## 2️⃣ Merge Keys
The columns `['RID', 'VISCODE', 'PTID']` were preserved as merge keys:
- They were saved before processing and concatenated back with processed numeric features.
- This allows future merging with other datasets.

## 3️⃣ Numeric Columns from Categorical Columns
Some columns contain numeric values stored as object types (e.g., `DXMDES`, `DXMOTHET`, `DXAPROB`) or multiple values separated by `|`.  
- Columns like `PTRACCAT`, `PTIDENT`, `PTNLANG`, `PTETHCATH`, `PTASIAN`, `PTIMMWHY`, and PTLANG test columns (`PTLANGPR1..6`, `PTLANGSP1..6`, etc.) were processed.

### Handling `|` Values
- Multi-value entries like `3|5` were aggregated into a single numeric value using the **mean**.
- This keeps the dimensionality low while preserving information.
- Other aggregation methods available: `max` or `first` if desired.

## 4️⃣ Missing Value Handling
- **Numeric columns**: missing values were filled with the column mean.
- **Categorical columns**: missing values were filled with the mode.

## 5️⃣ Categorical Columns
- True categorical columns (like `PTETHCATH`, `PTNLANG`, etc.) were encoded using `LabelEncoder` if necessary.
- Columns that are identifiers or dates were **not encoded**.

## 6️⃣ Standardization
- Numeric columns were standardized using the selected method (e.g., `StandardScaler`) in the main pipeline.
- Columns derived from `|` values are numeric and included in standardization.

## 7️⃣ Pipeline Summary
The full pipeline performs:
1. Dropping unnecessary columns.
2. Saving merge keys (`RID`, `VISCODE`, `PTID`).
3. Converting numeric-like categorical columns to numeric.
4. Handling multi-value `|` cells in numeric columns.
5. Filling missing values for numeric and categorical columns.
6. Label encoding categorical columns.
7. Standardizing numeric columns (excluding merge keys).
5. Saving the cleaned dataset to `preprocessed-data`.

This ensures that all datasets are **ready for downstream analysis or machine learning** while preserving key patient identifiers.
