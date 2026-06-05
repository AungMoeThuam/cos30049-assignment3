from pydantic import BaseModel, Field

# TODO: define EmailInput model
#   - subject: str (optional, max_length)
#   - body: str (required, min_length, max_length)
#   - sender: str (optional)

# TODO: define PredictionResult model
#   - label: str
#   - confidence: float

# TODO: define PredictionResponse model
#   - success: bool
#   - data: PredictionResult | None
#   - error: str | None
