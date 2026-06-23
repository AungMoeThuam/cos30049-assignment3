# Backend API Specification

This document details the API specification for the `email-spam-detection-backend` application. The backend is built using [FastAPI](https://fastapi.tiangolo.com/) (Python 3.12) to serve spam/ham predictions for the frontend application.

The API supports a single, combined prediction endpoint that accepts both copy-pasted email details (subject, body, sender) and uploaded email files (.eml, .msg, .txt) using `multipart/form-data`.

---

## 1. Directory Structure & Files

The backend specification covers and relates to the following files:
* Main entry point: [main.py](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-backend/main.py)
* API routes: [routes.py](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-backend/app/routes.py)
* Pydantic schemas: [schemas.py](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-backend/app/schemas.py)
* ML Classifier Integration: [models.py](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-backend/app/models.py)

---

## 2. Design Justification: Sentence-Level vs. Word-Level Classification

The classification breakdown in this project is designed **sentence-by-sentence** rather than **word-by-word** for the following reasons:

1. **Context Preservation**: Machine learning classifiers (like TF-IDF + Naive Bayes, Logistic Regression, or N-grams) rely on word associations and context. A single word (e.g., *"free"*, *"money"*, *"click"*) might be completely safe in a sentence like *"Feel free to email me"*, but spammy in *"Get free money now!"*. Running predictions word-by-word ignores semantic context and results in highly inaccurate individual word labels.
2. **UI/UX Readability**: Highlighting entire sentences based on spam risk is clean and readable. Word-by-word highlights create a "patchy" interface that is visually cluttered and hard to read.
3. **Performance Optimization**: Classifying a few sentences (e.g., 5 to 20 sentences) is significantly faster and consumes far fewer system resources than running inference on hundreds of individual words.

---

## 3. Data Models (Schemas)

The schemas in [schemas.py](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-backend/app/schemas.py) must define the following data structures.

### Sentence Breakdown: `SentencePrediction`
Holds prediction details for each individual sentence within the email body.
```python
from pydantic import BaseModel, Field

class SentencePrediction(BaseModel):
    text: str = Field(..., description="The individual sentence text")
    label: str = Field(..., description="Classification label: 'spam' or 'ham'")
    spam_probability: float = Field(..., ge=0.0, le=1.0, description="Spam probability percentage")
    ham_probability: float = Field(..., ge=0.0, le=1.0, description="Ham probability percentage")
```

### Prediction Payload: `PredictionResult`
Holds the complete classification results for the entire email, including the sentence-level breakdown.
```python
from typing import List

class PredictionResult(BaseModel):
    label: str = Field(..., description="Overall classification label: 'spam' or 'ham'")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence of the overall prediction")
    spam_probability: float = Field(..., ge=0.0, le=1.0, description="Overall spam probability")
    ham_probability: float = Field(..., ge=0.0, le=1.0, description="Overall ham probability")
    sentences: List[SentencePrediction] = Field(default=[], description="List of sentence-by-sentence classification details")
```

### API Wrapper: `PredictionResponse`
Standard response format for the prediction endpoint.
```python
from typing import Optional

class PredictionResponse(BaseModel):
    success: bool = Field(..., description="Indicates if the classification request succeeded")
    data: Optional[PredictionResult] = Field(None, description="Prediction data (null if error occurs)")
    error: Optional[str] = Field(None, description="Error message if the request failed")
```

---

## 4. Endpoint Specifications

### Classify Email (Combined Endpoint)
* **Endpoint**: `POST /api/v1/predict`
* **Purpose**: Process either a copy-pasted email or an uploaded email file.
* **Request Header**: `Content-Type: multipart/form-data`
* **Request Fields**:
  * `file`: Optional File upload (`.eml`, `.msg`, or `.txt`).
  * `subject`: Optional string.
  * `body`: Optional string (Required if `file` is not provided).
  * `sender`: Optional string.

* **Processing Flow**:
  1. **Validation**: Check if `file` is provided. If not, verify that `body` is provided and contains text. If both are missing, return a `400 Bad Request` with error details.
  2. **File Processing** (if `file` is provided):
     * Check extension. If not `.eml`, `.msg`, or `.txt`, reject the request.
     * **`.txt`**: Read file content and set it as `body`.
     * **`.eml`**: Parse with Python's standard `email` library. Extract `Subject` header, `From` header, and search MIME parts for the plain text `body`.
     * **`.msg`**: Parse using message extractors to extract subject, sender, and text body.
  3. **Sentence Tokenization**: Split the final `body` text into trimmed sentences (using regular expressions or light tokenizer).
  4. **ML Inference**: Run classification on the full text and on each sentence separately.
  5. **Response**: Construct and return `PredictionResponse`.

* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "label": "spam",
      "confidence": 0.92,
      "spam_probability": 0.92,
      "ham_probability": 0.08,
      "sentences": [
        {
          "text": "Congratulations!",
          "label": "spam",
          "spam_probability": 0.85,
          "ham_probability": 0.15
        },
        {
          "text": "You have won a free ticket.",
          "label": "spam",
          "spam_probability": 0.97,
          "ham_probability": 0.03
        },
        {
          "text": "Please click here to claim your reward.",
          "label": "spam",
          "spam_probability": 0.99,
          "ham_probability": 0.01
        },
        {
          "text": "Let me know when you get this.",
          "label": "ham",
          "spam_probability": 0.10,
          "ham_probability": 0.90
        }
      ]
    },
    "error": null
  }
  ```

* **Validation Error Response (400 Bad Request)**:
  ```json
  {
    "success": false,
    "data": null,
    "error": "Missing input payload. You must provide either an email body text or upload a valid email file."
  }
  ```

* **Format Error Response (400 Bad Request)**:
  ```json
  {
    "success": false,
    "data": null,
    "error": "Unsupported file format. Please upload a .eml, .msg, or .txt file."
  }
  ```

---

## 5. Algorithmic Workflows & Logic

### 5.1. Sentence Segmentation (Tokenization)
The backend splits the final text body into distinct sentences:
* **Approach**: Regular Expression parsing using punctuation rules (e.g., splitting on `(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s`).
* **Trimming**: Remove leading/trailing whitespaces from each sentence. Empty segments must be filtered out.

### 5.2. Classification Inference Pipeline
The `SpamClassifier` in [models.py](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-backend/app/models.py) must support scoring arbitrary string inputs:
1. **Full Text Prediction**: Preprocess the entire body string and run `predict_proba()` to compute overall probabilities.
2. **Sentence Prediction**: For each sentence, run the classifier to evaluate sentence-level spam risk and collect values in the `sentences` response list.
