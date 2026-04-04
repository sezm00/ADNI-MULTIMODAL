"""
Create a small dummy model object and save it with joblib to Model/test_models/
This model implements predict_proba and has minimal attributes used by the API.
Run: python create_dummy_model.py
"""
import os
import joblib
from dummy_model import DummyModel

if __name__ == '__main__':
    here = os.path.dirname(__file__)
    out_dir = os.path.join(here, 'test_models')
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, 'catboost_alzheimers_model.pkl')
    # remove any existing file to ensure we recreate the pickle
    try:
        if os.path.exists(out_path):
            os.remove(out_path)
    except Exception:
        pass

    # debug: print where DummyModel is defined
    print('DummyModel.__module__ =', DummyModel.__module__)

    model = DummyModel()
    joblib.dump(model, out_path)
    print(f"Wrote dummy model to: {out_path}")
