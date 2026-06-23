# Backend API Specification

This document details the API specification for the `email-spam-detection-backend` application. The backend is built using [FastAPI](https://fastapi.tiangolo.com/) (Python 3.12) to serve spam/ham predictions for the frontend application.

The API supports a single, combined prediction endpoint that accepts both copy-pasted email details (subject, body, sender) and uploaded email files (.eml, .msg, .txt) using `multipart/form-data`. The prediction pipeline uses **four distinct machine learning models** to classify the inputs:
1. **Naive Bayes** (`naive_bayes`)
2. **K-Means Clustering** (`k_means`)
3. **Logistic Regression** (`logistic_regression`)
4. **Linear SVM** (`linear_svm`)

---

## 1. Directory Structure & Files

The backend specification covers and relates to the following files:
* Main entry point: [main.py](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-backend/main.py)
* API routes: [routes.py](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-backend/app/routes.py)
* Pydantic schemas: [schemas.py](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-backend/app/schemas.py)
* ML Classifier Integration: [models.py](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-backend/app/models.py)
* Pre-trained ML Models Folder: [models](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-backend/models)

---

## 2. ML Models Integration Details

The pre-trained classifiers (e.g., `.pkl` or `.joblib` files) are stored in the [models](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-backend/models) folder. The backend loads these files at startup:
* `naive_bayes.pkl` (or `.joblib`)
* `k_means.pkl` (or `.joblib`)
* `logistic_regression.pkl` (or `.joblib`)
* `linear_svm.pkl` (or `.joblib`)

### Model Output Standardization
1. **Probability-Based Classifiers** (Naive Bayes & Logistic Regression):
   * Naturally output classification probabilities using `predict_proba()`.
2. **Non-Probability Classifiers** (Linear SVM & K-Means):
   * *Linear SVM*: Standard SVMs do not naturally output probability scores. The backend should utilize Platt scaling (e.g. setting `probability=True` during training in Scikit-Learn) to enable `predict_proba()`, or map the `decision_function()` score using a Sigmoid function to generate a pseudo-probability score.
   * *K-Means Clustering*: Distance metrics to cluster centroids are computed and normalized (e.g., using Softmax or inverse distance scaling) to generate ham/spam affinity scores between `0.0` and `1.0`.

---

## 3. Data Models (Schemas)

The schemas in [schemas.py](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-backend/app/schemas.py) must define the following multi-model data structures.

### Model Prediction Result: `ModelPrediction`
Holds prediction details from a single model.
```python
from pydantic import BaseModel, Field

class ModelPrediction(BaseModel):
    label: str = Field(..., description="Classification label: 'spam' or 'ham'")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence of the prediction (probability of the chosen label)")
    spam_probability: float = Field(..., ge=0.0, le=1.0, description="Model spam probability")
    ham_probability: float = Field(..., ge=0.0, le=1.0, description="Model ham probability")
```

### Sentence Breakdown: `SentencePrediction`
Holds prediction details for each individual sentence across the four models.
```python
from typing import Dict

class SentencePrediction(BaseModel):
    text: str = Field(..., description="The individual sentence text")
    models: Dict[str, ModelPrediction] = Field(..., description="Mapping of model identifier (e.g., 'naive_bayes') to its prediction")
```

### Prediction Payload: `PredictionResult`
Holds the complete classification results for the entire email across all models.
```python
from typing import List, Dict

class PredictionResult(BaseModel):
    models: Dict[str, ModelPrediction] = Field(..., description="Mapping of model identifiers to their overall prediction result")
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
* **Purpose**: Process either a copy-pasted email or an uploaded email file and compute predictions from all 4 models.
* **Request Header**: `Content-Type: multipart/form-data`
* **Request Fields**:
  * `file`: Optional File upload (`.eml`, `.msg`, or `.txt`).
  * `subject`: Optional string.
  * `body`: Optional string (Required if `file` is not provided).
  * `sender`: Optional string.

* **Processing Flow**:
  1. **Validation**: Validate that either `file` or `body` is provided. If both are missing, return `400 Bad Request`.
  2. **File Processing** (if `file` is provided): Check extension and parse the file to extract the text body, subject, and sender headers.
  3. **Sentence Tokenization**: Segment the email body into trimmed sentences.
  4. **Multi-Model Inference**:
     * Loop through the 4 loaded models (`naive_bayes`, `k_means`, `logistic_regression`, `linear_svm`).
     * Run predictions on the overall body text and generate `ModelPrediction` for each.
     * Loop through each sentence segment, run predictions under each model, and map the outputs.
  5. **Response**: Return the assembled `PredictionResponse`.

* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "models": {
        "naive_bayes": {
          "label": "spam",
          "confidence": 0.92,
          "spam_probability": 0.92,
          "ham_probability": 0.08
        },
        "k_means": {
          "label": "spam",
          "confidence": 0.74,
          "spam_probability": 0.74,
          "ham_probability": 0.26
        },
        "logistic_regression": {
          "label": "spam",
          "confidence": 0.88,
          "spam_probability": 0.88,
          "ham_probability": 0.12
        },
        "linear_svm": {
          "label": "spam",
          "confidence": 0.90,
          "spam_probability": 0.90,
          "ham_probability": 0.10
        }
      },
      "sentences": [
        {
          "text": "Congratulations!",
          "models": {
            "naive_bayes": {
              "label": "spam",
              "confidence": 0.85,
              "spam_probability": 0.85,
              "ham_probability": 0.15
            },
            "k_means": {
              "label": "spam",
              "confidence": 0.70,
              "spam_probability": 0.70,
              "ham_probability": 0.30
            },
            "logistic_regression": {
              "label": "spam",
              "confidence": 0.80,
              "spam_probability": 0.80,
              "ham_probability": 0.20
            },
            "linear_svm": {
              "label": "spam",
              "confidence": 0.82,
              "spam_probability": 0.82,
              "ham_probability": 0.18
            }
          }
        },
        {
          "text": "Let me know when you get this.",
          "models": {
            "naive_bayes": {
              "label": "ham",
              "confidence": 0.90,
              "spam_probability": 0.10,
              "ham_probability": 0.90
            },
            "k_means": {
              "label": "ham",
              "confidence": 0.65,
              "spam_probability": 0.35,
              "ham_probability": 0.65
            },
            "logistic_regression": {
              "label": "ham",
              "confidence": 0.94,
              "spam_probability": 0.06,
              "ham_probability": 0.94
            },
            "linear_svm": {
              "label": "ham",
              "confidence": 0.92,
              "spam_probability": 0.08,
              "ham_probability": 0.92
            }
          }
        }
      ]
    },
    "error": null
  }
  ```

* **Error Response (400 Bad Request)**:
  ```json
  {
    "success": false,
    "data": null,
    "error": "Missing input payload. You must provide either an email body text or upload a valid email file."
  }
  ```
