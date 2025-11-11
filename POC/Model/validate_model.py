"""
Validate a pickled model for compatibility with the API.
Usage:
  python validate_model.py [path/to/model.pkl]
If no path is provided, uses Model/test_models/catboost_alzheimers_model.pkl or $MODEL_PATH.
Exits with code 0 on success, 1 on failure.
"""
import sys
import os
import joblib

def find_model_path(arg_path=None):
    if arg_path:
        return arg_path
    env = os.environ.get('MODEL_PATH')
    if env:
        return env
    candidate = os.path.join(os.path.dirname(__file__), 'test_models', 'catboost_alzheimers_model.pkl')
    if os.path.exists(candidate):
        return candidate
    # search
    for d in [os.path.join(os.path.dirname(__file__), 'test_models'), os.path.dirname(__file__)]:
        if os.path.isdir(d):
            for f in os.listdir(d):
                if f.lower().endswith('.pkl'):
                    return os.path.join(d, f)
    return None


def validate(path):
    print('Validating model at:', path)
    if not path or not os.path.exists(path):
        print('Model file not found')
        return False
    try:
        m = joblib.load(path)
    except Exception as e:
        print('Failed to load model:', e)
        return False

    ok = True
    # Required attributes
    for attr in ['feature_names_', 'n_features_']:
        if not hasattr(m, attr):
            print(f'Missing attribute: {attr}')
            ok = False
        else:
            print(f'{attr}:', getattr(m, attr))

    # predict_proba test
    try:
        sample = [[70,1,12,0,26,0]]
        proba = m.predict_proba(sample)
        print('predict_proba output shape/sample:', proba)
        ok = ok and (len(proba) >= 1)
    except Exception as e:
        print('predict_proba failed:', e)
        ok = False

    return ok

if __name__ == '__main__':
    arg = sys.argv[1] if len(sys.argv) > 1 else None
    path = find_model_path(arg)
    ok = validate(path)
    print('\nVALIDATION RESULT: ', 'OK' if ok else 'FAILED')
    sys.exit(0 if ok else 1)
