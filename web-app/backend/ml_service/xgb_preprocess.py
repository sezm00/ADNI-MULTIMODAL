"""
XGBoost top-15 inference preprocessing.

Calibrated transforms baked in from the training notebook
(Main/notebooks/ALZ_Foresight_ADNI_Multi_Table_Pipeline_(Feature_Importance_on_Top_15).ipynb):
  1. Median / most-frequent imputation
  2. Yeo-Johnson power transform on skewed numeric features
  3. StandardScaler on (post-transform) numeric features
  4. OrdinalEncoder on categorical features
"""

import math
import numpy as np

FEATURE_ORDER = [
    'CDRSB', 'CDRSB_bl', 'FAQ', 'PTCOGBEG', 'mPACCtrailsB',
    'ORIGPROT', 'LDELTOTAL_BL', 'mPACCdigit_bl', 'PTADDX',
    'mPACCdigit', 'MMSE_bl', 'mPACCtrailsB_bl', 'FSVERSION_bl',
    'VISDATE_ptd', 'ADAS13'
]

# fused_model.joblib uses {CN:0, MCI:1, AD:2} but xgb_model_top15 was trained with
# LabelEncoder which sorts alphabetically -> {CN:0, Dementia:1, MCI:2}.
LABEL_MAP = {0: 'CN', 1: 'Dementia', 2: 'MCI'}

NUMERIC_CONFIG = {
    'CDRSB':           {'lambda': -0.5949, 'post_mean': 0.6049,    'post_std': 0.3817,    'median': 0.5},
    'CDRSB_bl':        {'lambda': -0.4273, 'post_mean': 0.6567,    'post_std': 0.4655,    'median': 0.5},
    'FAQ':             {'lambda': -0.3405, 'post_mean': 0.9534,    'post_std': 0.5443,    'median': 1.0},
    'ADAS13':          {'lambda':  0.1944, 'post_mean': 3.6602,    'post_std': 0.8771,    'median': 12.0},
    'MMSE_bl':         {'lambda':  5.1654, 'post_mean': 5970705.04,'post_std': 2659794.58,'median': 28.0},
    'LDELTOTAL_BL':    {'lambda':  0.6848, 'post_mean': 4.5055,    'post_std': 2.4142,    'median': 7.0},
    'mPACCdigit':      {'lambda':  1.0,    'post_mean': 10.28,     'post_std': 2.16,      'median': 10.5},
    'mPACCdigit_bl':   {'lambda':  1.0,    'post_mean': 10.42,     'post_std': 2.11,      'median': 10.5},
    'mPACCtrailsB':    {'lambda':  1.0,    'post_mean': -0.45,     'post_std': 8.65,      'median': 0.5},
    'mPACCtrailsB_bl': {'lambda':  1.0,    'post_mean': -0.05,     'post_std': 8.48,      'median': 0.5},
}

CAT_ENCODING = {
    'PTCOGBEG':     {'1': 0, '2': 1, 'yes': 0, 'no': 1, 'default': 0},
    'ORIGPROT':     {'ADNI1': 0, 'ADNI2': 1, 'ADNI3': 2, 'ADNIGO': 3, 'default': 1},
    'PTADDX':       {'1': 0, '2': 1, 'yes': 0, 'no': 1, 'default': 1},
    'FSVERSION_bl': {
        'freesurfer version 4.3': 0, 'freesurfer version 5.1': 1,
        'freesurfer version 5.3.0': 2, 'freesurfer version 6.0': 3,
        '4.3': 0, '5.1': 1, '5.3': 2, '6.0': 3,
        'default': 1,
    },
    'VISDATE_ptd':  {'default': 486},
}


def yj_transform(y: float, lam: float) -> float:
    if y >= 0:
        if abs(lam) < 1e-8:
            return math.log1p(y)
        return ((y + 1) ** lam - 1) / lam
    if abs(lam - 2) < 1e-8:
        return -math.log1p(-y)
    return -((-y + 1) ** (2 - lam) - 1) / (2 - lam)


def _encode_numeric(feat: str, val) -> float:
    cfg = NUMERIC_CONFIG[feat]
    if val is None or val == '':
        val = cfg['median']
    try:
        val = float(val)
    except (TypeError, ValueError):
        val = cfg['median']
    if not math.isfinite(val):
        val = cfg['median']

    lam = cfg['lambda']
    t = val if abs(lam - 1.0) < 1e-4 else yj_transform(val, lam)
    return (t - cfg['post_mean']) / cfg['post_std']


def _encode_categorical(feat: str, val) -> float:
    enc = CAT_ENCODING[feat]
    if val is None or val == '':
        return float(enc.get('default', 0))
    key_raw = str(val)
    key_lower = key_raw.lower().strip()
    if key_raw in enc:
        return float(enc[key_raw])
    if key_lower in enc:
        return float(enc[key_lower])
    return float(enc.get('default', -1))


def encode_row(patient: dict) -> np.ndarray:
    """Encode one tabular patient record into the (1, 15) feature matrix."""
    vec = [
        _encode_numeric(f, patient.get(f)) if f in NUMERIC_CONFIG
        else _encode_categorical(f, patient.get(f))
        for f in FEATURE_ORDER
    ]
    return np.asarray([vec], dtype=float)
