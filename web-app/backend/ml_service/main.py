"""
ADNI prediction service.

Exposes:
  GET  /health                  service + model status
  POST /predict/tabular         XGBoost top-15 only (JSON body)
  POST /predict/fused           XGBoost + CNN late fusion
                                (multipart: tabular JSON + optional DICOM zip)

The fusion endpoint gracefully falls back to XGBoost-only when no DICOM zip
is attached, so the frontend can use a single endpoint for both modes.
"""

from __future__ import annotations

import os
# Workaround for macOS OpenMP runtime conflict: XGBoost and PyTorch each ship
# their own libomp.dylib, and loading XGBoost before PyTorch deadlocks torch's
# thread pool. Setting this env var lets both coexist.
os.environ.setdefault('KMP_DUPLICATE_LIB_OK', 'TRUE')

# Import torch first (via cnn_predictor) so it claims the OpenMP runtime
# before joblib pulls in XGBoost's bundled copy.
import torch  # noqa: F401

import asyncio
import json
import warnings
from pathlib import Path
from typing import Optional

import joblib
import numpy as np
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from xgb_preprocess import FEATURE_ORDER, LABEL_MAP, encode_row

BASE_DIR = Path(__file__).resolve().parent
REPO_ROOT = BASE_DIR.parent.parent.parent
MODELS_DIR = REPO_ROOT / 'Main' / 'outputs' / 'models'

XGB_MODEL_PATH = Path(os.environ.get('XGB_MODEL_PATH', MODELS_DIR / 'xgb_model_top15.joblib'))
CNN_MODEL_PATH = Path(os.environ.get('CNN_MODEL_PATH', MODELS_DIR / 'cnn_v2.pt'))
FUSED_CONFIG_PATH = Path(os.environ.get('FUSED_CONFIG_PATH', MODELS_DIR / 'fused_model.joblib'))


def _load_xgb():
    with warnings.catch_warnings():
        warnings.simplefilter('ignore')
        return joblib.load(XGB_MODEL_PATH)


def _load_fused_config() -> dict:
    if FUSED_CONFIG_PATH.exists():
        return joblib.load(FUSED_CONFIG_PATH)
    return {'cnn_weight': 0.75, 'xgb_weight': 0.25}


xgb_model = _load_xgb()
fused_config = _load_fused_config()

# Preload the CNN at startup so requests never pay the load cost on the event loop.
# (Lazy-loading inside a sync handler stalls uvicorn for the full torch init.)
def _load_cnn():
    if not CNN_MODEL_PATH.exists():
        print(f'[ml_service] CNN weights not found at {CNN_MODEL_PATH}; fused endpoint will reject zip uploads.')
        return None
    from cnn_predictor import CNNPredictor  # local import; heavy deps
    print(f'[ml_service] Loading CNN weights from {CNN_MODEL_PATH} …')
    return CNNPredictor(CNN_MODEL_PATH)


cnn_predictor = _load_cnn()


def _get_cnn():
    if cnn_predictor is None:
        raise RuntimeError(f'CNN model not loaded (weights missing at {CNN_MODEL_PATH})')
    return cnn_predictor


# fused_model.joblib uses {CN:0, MCI:1, AD:2}; XGB uses {CN:0, Dementia:1, MCI:2}.
# We align CNN probabilities into XGB's index space before fusing.
CNN_TO_XGB_INDEX = [0, 2, 1]  # CNN[CN, MCI, AD] -> XGB[CN, Dementia, MCI] where AD==Dementia


def _xgb_probs(patient: dict) -> np.ndarray:
    X = encode_row(patient)
    return np.asarray(xgb_model.predict_proba(X)[0], dtype=float)


def _probs_to_response(probs: np.ndarray) -> dict:
    idx = int(np.argmax(probs))
    return {
        'prediction': LABEL_MAP[idx],
        'confidence': round(float(probs[idx]), 4),
        'probabilities': {
            'CN':       round(float(probs[0]), 4),
            'Dementia': round(float(probs[1]), 4),
            'MCI':      round(float(probs[2]), 4),
        },
    }


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(title='ALZ ForeSight Prediction Service', version='2.0.0')
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
)


class TabularRequest(BaseModel):
    # Open-ended: only the 15 features used by the model are read.
    class Config:
        extra = 'allow'


@app.get('/health')
def health():
    return {
        'status': 'ok',
        'xgb_model_loaded': xgb_model is not None,
        'xgb_model_path': str(XGB_MODEL_PATH),
        'cnn_model_path': str(CNN_MODEL_PATH),
        'cnn_loaded': cnn_predictor is not None,
        'fused_weights': {
            'cnn': fused_config.get('cnn_weight'),
            'xgb': fused_config.get('xgb_weight'),
        },
        'feature_order': FEATURE_ORDER,
    }


@app.post('/predict/tabular')
def predict_tabular(payload: TabularRequest):
    try:
        probs = _xgb_probs(payload.dict())
        result = _probs_to_response(probs)
        result['modelInfo'] = {'name': 'xgb_model_top15', 'mode': 'tabular'}
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Tabular prediction failed: {e}')


@app.post('/predict/fused')
async def predict_fused(
    tabular: str = Form(..., description='JSON-encoded patient tabular features'),
    scan: Optional[UploadFile] = File(None, description='DICOM .zip archive (optional)'),
):
    try:
        patient = json.loads(tabular)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="'tabular' field must be valid JSON")
    if not isinstance(patient, dict):
        raise HTTPException(status_code=400, detail="'tabular' must decode to an object")

    try:
        xgb_probs = _xgb_probs(patient)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'XGBoost prediction failed: {e}')

    # No scan -> XGBoost-only result (graceful fallback).
    if scan is None:
        result = _probs_to_response(xgb_probs)
        result['modelInfo'] = {'name': 'xgb_model_top15', 'mode': 'tabular_fallback'}
        return result

    # CNN path — run in a worker thread so we don't block the event loop.
    try:
        zip_bytes = await scan.read()
        cnn = _get_cnn()
        cnn_probs_raw = await asyncio.to_thread(cnn.predict_zip, zip_bytes)  # order: CN, MCI, AD
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'CNN prediction failed: {e}')

    cnn_probs_aligned = np.array([
        cnn_probs_raw[0],            # CN
        cnn_probs_raw[2],            # AD -> Dementia
        cnn_probs_raw[1],            # MCI
    ], dtype=float)

    w_cnn = float(fused_config.get('cnn_weight', 0.75))
    w_xgb = float(fused_config.get('xgb_weight', 0.25))
    fused_probs = w_cnn * cnn_probs_aligned + w_xgb * xgb_probs

    result = _probs_to_response(fused_probs)
    result['modelInfo'] = {
        'name': 'fused_model',
        'mode': 'fused',
        'weights': {'cnn': w_cnn, 'xgb': w_xgb},
    }
    result['components'] = {
        'cnn':      _probs_to_response(cnn_probs_aligned),
        'xgboost':  _probs_to_response(xgb_probs),
    }
    return result


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=int(os.environ.get('ML_SERVICE_PORT', 8000)))
