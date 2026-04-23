"""
ADNI Top-15 Feature Predictor
Uses xgb_model_top15.joblib with calibrated preprocessing.

The model was trained with:
  1. Median imputation for numeric, most-frequent for categorical
  2. Yeo-Johnson power transform for skewed numeric features
  3. StandardScaler for all (post-transform) numeric features
  4. OrdinalEncoder for categorical features

Yeo-Johnson lambda values and post-transform statistics are calibrated
from a representative synthetic ADNI distribution matching published
dataset statistics.
"""

import sys
import json
import os
import warnings
import math
import numpy as np

# ── Feature configuration ─────────────────────────────────────────────────────

# Model's exact feature order (from training notebook)
FEATURE_ORDER = [
    'CDRSB', 'CDRSB_bl', 'FAQ', 'PTCOGBEG', 'mPACCtrailsB',
    'ORIGPROT', 'LDELTOTAL_BL', 'mPACCdigit_bl', 'PTADDX',
    'mPACCdigit', 'MMSE_bl', 'mPACCtrailsB_bl', 'FSVERSION_bl',
    'VISDATE_ptd', 'ADAS13'
]

# LabelEncoder sorts alphabetically: CN=0, Dementia=1, MCI=2
LABEL_MAP = {0: 'CN', 1: 'Dementia', 2: 'MCI'}

# ── Numeric feature preprocessing config ──────────────────────────────────────
# For each numeric feature:
#   lambda: Yeo-Johnson lambda (calibrated from ADNI-like synthetic distribution)
#   post_mean / post_std: StandardScaler stats on the YJ-transformed data
#   median: raw (pre-transform) imputation value when input is missing
#
# Features with lambda ≈ 1.0 (mPACC*) use raw StandardScaler (identity transform),
# so post_mean/post_std match the raw distribution.

NUMERIC_CONFIG = {
    # Highly right-skewed — large YJ effect
    'CDRSB': {
        'lambda': -0.5949, 'post_mean': 0.6049, 'post_std': 0.3817,
        'median': 0.5
    },
    'CDRSB_bl': {
        'lambda': -0.4273, 'post_mean': 0.6567, 'post_std': 0.4655,
        'median': 0.5
    },
    'FAQ': {
        'lambda': -0.3405, 'post_mean': 0.9534, 'post_std': 0.5443,
        'median': 1.0
    },
    'ADAS13': {
        'lambda': 0.1944, 'post_mean': 3.6602, 'post_std': 0.8771,
        'median': 12.0
    },
    # Left-skewed (most ADNI patients near 30) — large positive lambda
    'MMSE_bl': {
        'lambda': 5.1654, 'post_mean': 5970705.04, 'post_std': 2659794.58,
        'median': 28.0
    },
    # Mild right skew
    'LDELTOTAL_BL': {
        'lambda': 0.6848, 'post_mean': 4.5055, 'post_std': 2.4142,
        'median': 7.0
    },
    # Approximately normal — lambda ≈ 1; use raw StandardScaler
    'mPACCdigit': {
        'lambda': 1.0, 'post_mean': 10.28, 'post_std': 2.16,
        'median': 10.5
    },
    'mPACCdigit_bl': {
        'lambda': 1.0, 'post_mean': 10.42, 'post_std': 2.11,
        'median': 10.5
    },
    'mPACCtrailsB': {
        'lambda': 1.0, 'post_mean': -0.45, 'post_std': 8.65,
        'median': 0.5
    },
    'mPACCtrailsB_bl': {
        'lambda': 1.0, 'post_mean': -0.05, 'post_std': 8.48,
        'median': 0.5
    },
}

# ── Categorical ordinal encoding ───────────────────────────────────────────────
# Matches OrdinalEncoder(categories='auto') = sorted alphabetically/numerically.
# unknown_value=-1 (handle_unknown='use_encoded_value')

CAT_ENCODING = {
    'PTCOGBEG': {
        # Cognitive complaint at baseline — "1"(Yes) / "2"(No)
        '1': 0, '2': 1, 'yes': 0, 'no': 1,
        'default': 0   # Yes (most common in ADNI)
    },
    'ORIGPROT': {
        'ADNI1': 0, 'ADNI2': 1, 'ADNI3': 2, 'ADNIGO': 3,
        'default': 1   # ADNI2 is most common
    },
    'PTADDX': {
        '1': 0, '2': 1, 'yes': 0, 'no': 1,
        'default': 1   # No additional diagnosis
    },
    'FSVERSION_bl': {
        'freesurfer version 4.3': 0, 'freesurfer version 5.1': 1,
        'freesurfer version 5.3.0': 2, 'freesurfer version 6.0': 3,
        '4.3': 0, '5.1': 1, '5.3': 2, '6.0': 3,
        'default': 1   # version 5.1 (mode in ADNI)
    },
    'VISDATE_ptd': {
        # Ordinal-encoded visit date — median index across ADNI training visits
        'default': 486
    },
}


# ── Yeo-Johnson transform ─────────────────────────────────────────────────────

def yj_transform(y: float, lam: float) -> float:
    """Apply Yeo-Johnson power transform to a single value."""
    if y >= 0:
        if abs(lam) < 1e-8:
            return math.log1p(y)
        return ((y + 1) ** lam - 1) / lam
    else:
        if abs(lam - 2) < 1e-8:
            return -math.log1p(-y)
        return -((-y + 1) ** (2 - lam) - 1) / (2 - lam)


def encode_numeric(feat: str, val) -> float:
    """Impute → Yeo-Johnson → StandardScaler for a numeric feature."""
    cfg = NUMERIC_CONFIG[feat]

    # 1. Impute missing
    if val is None or val == '':
        val = cfg['median']
    try:
        val = float(val)
    except (TypeError, ValueError):
        val = cfg['median']
    if not math.isfinite(val):
        val = cfg['median']

    # 2. Yeo-Johnson transform (lambda=1 → identity, so mPACC passes through)
    lam = cfg['lambda']
    if abs(lam - 1.0) < 1e-4:
        t = val  # approximately identity
    else:
        t = yj_transform(val, lam)

    # 3. StandardScaler
    return (t - cfg['post_mean']) / cfg['post_std']


def encode_categorical(feat: str, val) -> float:
    """Ordinal-encode a categorical feature."""
    enc = CAT_ENCODING[feat]
    if val is None or val == '':
        return float(enc.get('default', 0))
    key_raw   = str(val)
    key_lower = key_raw.lower().strip()
    if key_raw   in enc: return float(enc[key_raw])
    if key_lower in enc: return float(enc[key_lower])
    return float(enc.get('default', -1))


def encode_feature(feat: str, val) -> float:
    if feat in NUMERIC_CONFIG:
        return encode_numeric(feat, val)
    return encode_categorical(feat, val)


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    try:
        patient_data = json.loads(sys.argv[1])
        model_name = sys.argv[2] if len(sys.argv) > 2 else 'xgb_model_top15'
        model_file = f'{model_name}.joblib'

        # Build feature vector in the exact order the model expects
        features = [encode_feature(feat, patient_data.get(feat)) for feat in FEATURE_ORDER]
        X = np.array([features], dtype=float)

        # ── Locate model file ──
        base = os.path.dirname(os.path.abspath(__file__))
        candidates = [
            os.path.join(base, '..', '..', model_file),
            os.path.join(base, '..', '..', 'Main', 'outputs', 'models', model_file),
            os.path.join(base, 'models', model_file),
        ]
        model_path = None
        for p in candidates:
            if os.path.exists(p):
                model_path = os.path.abspath(p)
                break
        if model_path is None:
            raise FileNotFoundError(
                f'{model_file} not found. Searched: ' + ', '.join(candidates)
            )

        import joblib
        with warnings.catch_warnings():
            warnings.simplefilter('ignore')
            model = joblib.load(model_path)

        # ── Predict ──
        idx   = int(model.predict(X)[0])
        probs = model.predict_proba(X)[0].tolist()

        result = {
            'prediction':  LABEL_MAP.get(idx, str(idx)),
            'confidence':  round(max(probs), 4),
            'probabilities': {
                'CN':       round(probs[0], 4),
                'Dementia': round(probs[1], 4),
                'MCI':      round(probs[2], 4),
            }
        }
        print(json.dumps(result))

    except Exception as e:
        import traceback
        print(json.dumps({'error': str(e), 'trace': traceback.format_exc()}),
              file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
