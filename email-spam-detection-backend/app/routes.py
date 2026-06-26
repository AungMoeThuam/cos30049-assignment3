import csv
import io
import re
import tempfile
from collections import Counter
from pathlib import Path
from typing import Dict, Optional

import pandas as pd
from fastapi import APIRouter, File, Form, Response, UploadFile

from app.models import classifier
from app.schemas import (
    CsvPredictionResponse,
    CsvPredictionResult,
    ModelBatchSummary,
    ModelPrediction,
    PredictionResponse,
    PredictionResult,
    SpamWordInfo,
    SentenceRequest,
    TokenPrediction,
    SentenceAnalysisResult,
    SentenceAnalysisResponse,
)
from app.utils import clean_text, clean_db_text, extract_features, parse_eml, prepare_email_text
from nltk.corpus import stopwords

router = APIRouter()

MODEL_NAMES = ("naive_bayes", "k_means", "logistic_regression", "linear_svm")
SUPPORTED_EMAIL_EXTENSIONS = {".eml", ".msg", ".txt"}
CSV_EXTENSION = ".csv"
MISSING_INPUT_ERROR = (
    "Missing input payload. You must provide either an email body text or upload a "
    "valid email file."
)


def _split_sentences(text: str) -> list[str]:
    sentences = [
        sentence.strip()
        for sentence in re.split(r"(?<=[.!?])\s+", text)
        if sentence.strip()
    ]
    return sentences or [text.strip()]


def _get_real_model_predictions(text: str) -> Dict[str, ModelPrediction]:
    if not text.strip():
        return {
            name: ModelPrediction(
                label="ham", confidence=1.0, spam_probability=0.0, ham_probability=1.0
            )
            for name in MODEL_NAMES
        }

    df = extract_features(pd.Series([text]))
    results = classifier.predict_all(df)
    predictions = {}
    
    for name, res in results.items():
        if "error" in res:
            predictions[name] = ModelPrediction(
                label="error", confidence=0.0, spam_probability=0.0, ham_probability=1.0
            )
            continue

        label = "spam" if str(res["label"]) == "1" else "ham"
        confidence = float(res["confidence"])

        if label == "spam":
            spam_probability = confidence
            ham_probability = 1.0 - confidence
        else:
            ham_probability = confidence
            spam_probability = 1.0 - confidence

        predictions[name] = ModelPrediction(
            label=label,
            confidence=confidence,
            spam_probability=spam_probability,
            ham_probability=ham_probability,
        )
        
    return predictions


async def _extract_real_body(file: Optional[UploadFile], body: Optional[str], subject: Optional[str]) -> str:
    if file is None:
        return prepare_email_text(subject or "", body or "")

    content = await file.read()
    extension = Path(file.filename or "").suffix.lower()

    if extension == ".txt":
        file_body = content.decode("utf-8", errors="ignore").strip()
        return prepare_email_text(subject or "", file_body)

    if extension in {".eml", ".msg"}:
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        try:
            eml_subject, eml_body = parse_eml(tmp_path)
            final_sub = subject if subject and subject.strip() else eml_subject
            return prepare_email_text(final_sub, eml_body)
        finally:
            Path(tmp_path).unlink(missing_ok=True)

    return prepare_email_text(subject or "", body or "")


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

    combined_text = await _extract_real_body(file, body, subject)
    if sender:
        combined_text = f"{sender} {combined_text}"

    df = extract_features(pd.Series([combined_text]))
    overall_models = _get_real_model_predictions(combined_text)

    # Pull the 9 numeric feature values from the DataFrame row
    feature_cols = [
        "num_urls", "num_exclamation", "num_question", "num_dollar",
        "num_all_caps", "num_numbers", "word_count", "capital_ratio", "emoji_count",
    ]
    features_dict = {
        col: float(df.iloc[0][col]) for col in feature_cols if col in df.columns
    }

    sentence_predictions = [
        {
            "text": sentence,
            "models": _get_real_model_predictions(sentence),
        }
        for sentence in _split_sentences(combined_text)
    ]

    return PredictionResponse(
        success=True,
        data=PredictionResult(
            models=overall_models,
            sentences=sentence_predictions,
            features=features_dict,
        ),
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

    content = await file.read()
    try:
        decoded_content = content.decode("utf-8")
        reader = csv.DictReader(io.StringIO(decoded_content))
    except Exception:
        response.status_code = 400
        return CsvPredictionResponse(success=False, data=None, error="Invalid CSV format.")

    if not reader.fieldnames or "body" not in reader.fieldnames:
        response.status_code = 400
        return CsvPredictionResponse(success=False, data=None, error="CSV file is missing the required 'body' column.")

    total_emails = 0
    model_summaries = {name: {"spam": 0, "ham": 0} for name in MODEL_NAMES}
    spam_texts = []

    for row in reader:
        text = row.get("body", "")
        if not text or not str(text).strip():
            continue
            
        total_emails += 1
        
        subject = row.get("subject", "")
        combined_text = prepare_email_text(subject, text)

        features_df = extract_features(pd.Series([combined_text]))
        results = classifier.predict_all(features_df)

        is_nb_spam = False
        
        for name, res in results.items():
            if "error" not in res:
                if str(res["label"]) == "1":
                    model_summaries[name]["spam"] += 1
                    if name == "naive_bayes":
                        is_nb_spam = True
                else:
                    model_summaries[name]["ham"] += 1

        if is_nb_spam:
            spam_texts.append(combined_text)

    if total_emails == 0:
        return CsvPredictionResponse(
            success=True,
            data=CsvPredictionResult(total_emails=0, model_summaries={}, top_spam_words=[]),
            error=None,
        )

    word_counts = Counter()
    total_spam_emails = len(spam_texts)
    
    try:
        stop_words = set(stopwords.words("english"))
    except Exception:
        stop_words = set()
    
    for text in spam_texts:
        cleaned_text = clean_text(text)
        words = [w for w in re.findall(r'\b[a-z]{3,}\b', cleaned_text) if w not in stop_words]
        word_counts.update(set(words))

    top_spam_words = []
    
    for word, count in word_counts.most_common(max(top_n, 0)):
        percentage = round((count / total_spam_emails) * 100, 1) if total_spam_emails > 0 else 0.0
        top_spam_words.append(SpamWordInfo(word=word, percentage=percentage, count=count))

    final_summaries = {
        name: ModelBatchSummary(spam_count=counts["spam"], ham_count=counts["ham"])
        for name, counts in model_summaries.items()
    }

    return CsvPredictionResponse(
        success=True,
        data=CsvPredictionResult(
            total_emails=total_emails,
            model_summaries=final_summaries,
            top_spam_words=top_spam_words,
        ),
        error=None,
    )


@router.get("/feature-averages")
async def get_feature_averages():
    return {
        "spam": {
            "num_urls": 3.6833,
            "num_exclamation": 7.165,
            "num_question": 4.137,
            "num_dollar": 8.0181,
            "num_all_caps": 34.5333,
            "num_numbers": 175.2476,
            "word_count": 289.8766,
            "capital_ratio": 0.1632,
            "emoji_count": 0.483
        },
        "ham": {
            "num_urls": 2.7441,
            "num_exclamation": 1.3018,
            "num_question": 2.2157,
            "num_dollar": 1.3032,
            "num_all_caps": 42.9056,
            "num_numbers": 713.131,
            "word_count": 499.6754,
            "capital_ratio": 0.1739,
            "emoji_count": 0.0573
        },
        "scaler": {
            "num_urls": { "mean": 3.0, "std": 2.0 },
            "num_exclamation": { "mean": 3.0, "std": 4.0 },
            "num_question": { "mean": 2.8, "std": 3.0 },
            "num_dollar": { "mean": 3.3, "std": 4.5 },
            "num_all_caps": { "mean": 40.0, "std": 30.0 },
            "num_numbers": { "mean": 400.0, "std": 400.0 },
            "word_count": { "mean": 400.0, "std": 250.0 },
            "capital_ratio": { "mean": 0.17, "std": 0.06 },
            "emoji_count": { "mean": 0.2, "std": 0.4 }
        }
    }


@router.post("/predict/sentence", response_model=SentenceAnalysisResponse)
async def predict_sentence(request: SentenceRequest) -> SentenceAnalysisResponse:
    text = request.sentence
    if not text or not text.strip():
        return SentenceAnalysisResponse(
            success=False,
            data=None,
            error="Empty sentence provided."
        )
    
    # Clean text using clean_db_text
    cleaned_text = clean_db_text(text)
    
    # Filter stopwords and short tokens
    try:
        stop_words = set(stopwords.words("english"))
    except Exception:
        stop_words = set()
        
    tokens = [t for t in re.findall(r'\b[a-z]{3,}\b', cleaned_text) if t not in stop_words]
    
    token_predictions = []
    for token in tokens:
        models_pred = _get_real_model_predictions(token)
        token_predictions.append(TokenPrediction(token=token, models=models_pred))
        
    return SentenceAnalysisResponse(
        success=True,
        data=SentenceAnalysisResult(tokens=token_predictions),
        error=None
    )