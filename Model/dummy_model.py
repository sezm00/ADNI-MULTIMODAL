import numpy as np

class DummyModel:
    def __init__(self):
        # set attributes the API may inspect
        self.feature_names_ = ['age','gender','education','apoe4','mmse','cdr']
        self.n_features_ = len(self.feature_names_)

    def predict_proba(self, X):
        # Return fixed probabilities for testing
        n = 1
        try:
            n = len(X)
        except Exception:
            pass
        probs = np.tile([0.65, 0.35], (n,1))
        return probs
