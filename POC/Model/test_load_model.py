import os
import joblib

p = os.path.join(os.path.dirname(__file__), 'test_models', 'catboost_alzheimers_model.pkl')
print('Trying to load:', p)
try:
    m = joblib.load(p)
    print('Loaded model type:', type(m))
    print('Has feature_names_:', hasattr(m, 'feature_names_'))
    if hasattr(m, 'feature_names_'):
        print('feature_names_:', m.feature_names_)
    print('Has n_features_:', hasattr(m, 'n_features_'))
    if hasattr(m, 'n_features_'):
        print('n_features_:', m.n_features_)
    # Test predict_proba
    try:
        print('predict_proba on dummy input:', m.predict_proba([[70,1,12,0,26,0]]))
    except Exception as e:
        print('predict_proba error:', e)
except Exception as e:
    print('Error loading model:', e)
