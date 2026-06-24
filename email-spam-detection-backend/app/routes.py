import re
from pathlib import Path
from typing import Dict, Optional

from fastapi import APIRouter, File, Form, Response, UploadFile

from app.schemas import (
    CsvPredictionResponse,
    CsvPredictionResult,
    ModelBatchSummary,
    ModelPrediction,
    PredictionResponse,
    PredictionResult,
    SpamWordInfo,
)

router = APIRouter()

MODEL_NAMES = ("naive_bayes", "k_means", "logistic_regression", "linear_svm")
SUPPORTED_EMAIL_EXTENSIONS = {".eml", ".msg", ".txt"}
CSV_EXTENSION = ".csv"
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


@router.post("/predict/csv", response_model=CsvPredictionResponse)
async def predict_csv(
    response: Response,
    file: UploadFile = File(...),
    top_n: int = 10,
) -> CsvPredictionResponse:
    if Path(file.filename or "").suffix.lower() != CSV_EXTENSION:
        response.status_code = 400
        return CsvPredictionResponse(
            success=False,
            data=None,
            error="Invalid file type. Upload a .csv file.",
        )

    mock_top_spam_words = [
        SpamWordInfo(word="free", percentage=84.6, count=55),
        SpamWordInfo(word="winner", percentage=69.2, count=45),
        SpamWordInfo(word="claim", percentage=61.5, count=40),
        SpamWordInfo(word="urgent", percentage=53.8, count=35),
        SpamWordInfo(word="offer", percentage=49.2, count=32),
        SpamWordInfo(word="click", percentage=46.2, count=30),
        SpamWordInfo(word="prize", percentage=43.1, count=28),
        SpamWordInfo(word="guaranteed", percentage=38.5, count=25),
        SpamWordInfo(word="cash", percentage=35.4, count=23),
        SpamWordInfo(word="reply", percentage=30.8, count=20),
    ][: max(top_n, 0)]

    return CsvPredictionResponse(
        success=True,
        data=CsvPredictionResult(
            total_emails=150,
            model_summaries={
                "naive_bayes": ModelBatchSummary(spam_count=65, ham_count=85),
                "k_means": ModelBatchSummary(spam_count=58, ham_count=92),
                "logistic_regression": ModelBatchSummary(spam_count=62, ham_count=88),
                "linear_svm": ModelBatchSummary(spam_count=64, ham_count=86),
            },
            top_spam_words=mock_top_spam_words,
        ),
        error=None,
    )
