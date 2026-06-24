import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, Any, Tuple
import os

# Base directory for models
MODELS_DIR = Path(__file__).parent.parent / "models"

class MultiModelClassifier:
    def __init__(self):
        self.models = {}
        
    def load_models(self) -> None:
        """Load all 4 ML models."""
        model_files = {
            "naive_bayes": "naive_bayes_pipeline.pkl",
            "k_means": "kmeans_pipeline.pkl",
            "logistic_regression": "logistic_regression_pipeline.pkl",
            "linear_svm": "linear_svm_pipeline.pkl"
        }
        
        for name, filename in model_files.items():
            model_path = MODELS_DIR / filename
            if model_path.exists():
                self.models[name] = joblib.load(model_path)
            else:
                print(f"Warning: Model file not found at {model_path}")

    def _sigmoid(self, x: float) -> float:
        """Sigmoid function for scaling scores to probabilities."""
        return 1 / (1 + np.exp(-x))

    def predict_linear_svm(self, model: Any, df: pd.DataFrame) -> Tuple[str, float]:
        """Linear SVM wrapper to map decision_function to probability."""
        label = model.predict(df)[0]
        score = model.decision_function(df)[0]
        prob = self._sigmoid(score)
        
        # In binary classification, decision_function > 0 generally corresponds to the positive class.
        if score > 0:
            confidence = prob
        else:
            confidence = 1.0 - prob
            
        return str(label), float(confidence)

    def predict_kmeans(self, model: Any, df: pd.DataFrame) -> Tuple[str, float]:
        """K-Means wrapper to compute pseudo-probability from centroid distances."""
        label = model.predict(df)[0]
        distances = model.transform(df)[0]
        
        # Convert distances to pseudo-probabilities
        eps = 1e-6
        inv_distances = 1.0 / (distances + eps)
        probs = inv_distances / np.sum(inv_distances)
        
        confidence = max(probs)
        return str(label), float(confidence)

    def predict_proba_standard(self, model: Any, df: pd.DataFrame) -> Tuple[str, float]:
        """Standard wrapper for models with predict_proba (Naive Bayes, Logistic Regression)."""
        label = model.predict(df)[0]
        probs = model.predict_proba(df)[0]
        confidence = max(probs)
        return str(label), float(confidence)

    def predict(self, model_name: str, df: pd.DataFrame) -> Tuple[str, float]:
        """Route to the appropriate prediction adapter."""
        if model_name not in self.models:
            raise ValueError(f"Model {model_name} not loaded or not found.")
            
        model = self.models[model_name]
        
        if model_name == "linear_svm":
            return self.predict_linear_svm(model, df)
        elif model_name == "k_means":
            return self.predict_kmeans(model, df)
        else:
            return self.predict_proba_standard(model, df)
            
    def predict_all(self, df: pd.DataFrame) -> Dict[str, Dict[str, Any]]:
        """Run prediction on all loaded models."""
        results = {}
        for name in self.models.keys():
            try:
                label, confidence = self.predict(name, df)
                results[name] = {"label": label, "confidence": confidence}
            except Exception as e:
                results[name] = {"error": str(e)}
        return results

# Singleton instance
classifier = MultiModelClassifier()
