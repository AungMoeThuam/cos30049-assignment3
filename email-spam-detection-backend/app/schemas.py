from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class ModelPrediction(BaseModel):
    label: str = Field(..., description="Predicted class label, either spam or ham")
    confidence: float = Field(
        ..., ge=0.0, le=1.0, description="Confidence for the predicted label"
    )
    spam_probability: float = Field(
        ..., ge=0.0, le=1.0, description="Probability that the input is spam"
    )
    ham_probability: float = Field(
        ..., ge=0.0, le=1.0, description="Probability that the input is ham"
    )


class SentencePrediction(BaseModel):
    text: str = Field(..., description="Original sentence text")
    models: Dict[str, ModelPrediction] = Field(
        ..., description="Prediction results keyed by model identifier"
    )


class PredictionResult(BaseModel):
    models: Dict[str, ModelPrediction] = Field(
        ..., description="Overall email prediction results keyed by model identifier"
    )
    sentences: List[SentencePrediction] = Field(
        ..., description="Sentence-level prediction breakdown"
    )


class PredictionResponse(BaseModel):
    success: bool = Field(..., description="Indicates if prediction succeeded")
    data: Optional[PredictionResult] = Field(
        None, description="Prediction results, null on failure"
    )
    error: Optional[str] = Field(None, description="Error message on failure")


class SpamWordInfo(BaseModel):
    word: str = Field(..., description="The word/token")
    percentage: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Percentage of spam emails that contain this word",
    )
    count: int = Field(..., ge=0, description="Total frequency count in spam emails")


class ModelBatchSummary(BaseModel):
    spam_count: int = Field(..., ge=0, description="Emails classified as spam")
    ham_count: int = Field(..., ge=0, description="Emails classified as ham")


class CsvPredictionResult(BaseModel):
    total_emails: int = Field(
        ..., ge=0, description="Total number of valid email rows processed"
    )
    model_summaries: Dict[str, ModelBatchSummary] = Field(
        ..., description="Spam/ham counts for each model"
    )
    top_spam_words: List[SpamWordInfo] = Field(
        ..., description="Top spam trigger words found in spam emails"
    )


class CsvPredictionResponse(BaseModel):
    success: bool = Field(..., description="Indicates if batch processing succeeded")
    data: Optional[CsvPredictionResult] = Field(
        None, description="Summarized prediction results, null on failure"
    )
    error: Optional[str] = Field(None, description="Error message on failure")
