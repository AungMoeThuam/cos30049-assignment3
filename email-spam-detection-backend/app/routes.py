import re
from pathlib import Path
from typing import Dict, Optional

from fastapi import APIRouter, File, Form, Response, UploadFile

from app.schemas import ModelPrediction, PredictionResponse, PredictionResult

router = APIRouter()

MODEL_NAMES = ("naive_bayes", "k_means", "logistic_regression", "linear_svm")
SUPPORTED_EMAIL_EXTENSIONS = {".eml", ".msg", ".txt"}
MISSING_INPUT_ERROR = (
    "Missing input payload. You must provide either an email body text or upload a "
    "valid email file."
)


def _mock_model_predictions(spam_probability: float) -> Dict[str, ModelPrediction]:
    ham_probability = round(1.0 - spam_probability, 2)
    label = "spam" if spam_probability >= ham_probability else "ham"
    confidence = max(spam_probability, ham_probability)

    return {
        model_name: ModelPrediction(
            label=label,
            confidence=confidence,
            spam_probability=spam_probability,
            ham_probability=ham_probability,
        )
        for model_name in MODEL_NAMES
    }


def _split_sentences(text: str) -> list[str]:
    sentences = [
        sentence.strip()
        for sentence in re.split(r"(?<=[.!?])\s+", text)
        if sentence.strip()
    ]
    return sentences or [text.strip()]


async def _extract_stub_body(file: UploadFile, body: Optional[str]) -> str:
    content = await file.read()
    if Path(file.filename or "").suffix.lower() == ".txt":
        return content.decode("utf-8", errors="ignore").strip()

    return body or f"Mock prediction content extracted from {file.filename}."


@router.post("/predict", response_model=PredictionResponse)
async def predict_email(
    response: Response,
    file: Optional[UploadFile] = File(None),
    subject: Optional[str] = Form(None),
    body: Optional[str] = Form(None),
    sender: Optional[str] = Form(None),
) -> PredictionResponse:
    if file is None and not (body and body.strip()):
        response.status_code = 400
        return PredictionResponse(success=False, data=None, error=MISSING_INPUT_ERROR)

    if file is not None:
        extension = Path(file.filename or "").suffix.lower()
        if extension not in SUPPORTED_EMAIL_EXTENSIONS:
            response.status_code = 400
            return PredictionResponse(
                success=False,
                data=None,
                error="Unsupported file type. Upload a .eml, .msg, or .txt file.",
            )

    email_body = await _extract_stub_body(file, body) if file else body.strip()
    combined_text = " ".join(
        part.strip() for part in (subject, email_body, sender) if part and part.strip()
    )

    overall_models = _mock_model_predictions(spam_probability=0.92)
    sentence_predictions = [
        {
            "text": sentence,
            "models": _mock_model_predictions(
                spam_probability=0.85 if index == 0 else 0.10
            ),
        }
        for index, sentence in enumerate(_split_sentences(combined_text))
    ]

    return PredictionResponse(
        success=True,
        data=PredictionResult(models=overall_models, sentences=sentence_predictions),
        error=None,
    )
