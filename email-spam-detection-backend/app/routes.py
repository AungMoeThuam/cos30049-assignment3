from fastapi import APIRouter

router = APIRouter()

# TODO: add health check endpoint (GET /health)
# TODO: add prediction endpoint (POST /predict)
#   - accept email input via Pydantic model
#   - preprocess input, call model.predict()
#   - return prediction result
