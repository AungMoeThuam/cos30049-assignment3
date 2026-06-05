from pathlib import Path

# TODO: replace with actual ML model integration
# class SpamClassifier:
#     def __init__(self, model_path: str = "model.pkl"):
#         self.model_path = Path(model_path)
#         self._model = None
#
#     def load(self) -> None:
#         self._model = joblib.load(self.model_path)
#
#     def predict(self, features: list) -> tuple[str, float]:
#         label = self._model.predict(features)[0]
#         confidence = max(self._model.predict_proba(features)[0])
#         return str(label), float(confidence)
#
#
# classifier = SpamClassifier()
