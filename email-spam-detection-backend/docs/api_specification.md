# Backend API Specification

This document details the API specification for the `email-spam-detection-backend` application. The backend is built using [FastAPI](https://fastapi.tiangolo.com/) (Python 3.12) to serve spam/ham predictions for the frontend application.

The API supports:
1. **Single Email Prediction**: A combined endpoint accepting raw copy-pasted fields or single email files (`.eml`, `.msg`, `.txt`) via `multipart/form-data`.
2. **CSV Batch Email Prediction**: A separate endpoint accepting a CSV file containing multiple emails for batch processing, returning classification summaries per model and a list of top spam trigger keywords.

The prediction pipeline uses **four distinct machine learning models** to classify inputs:
* **Naive Bayes** (`naive_bayes`)
* **K-Means Clustering** (`k_means`)
* **Logistic Regression** (`logistic_regression`)
* **Linear SVM** (`linear_svm`)

---

## 1. Directory Structure & Files

The backend specification covers and relates to the following files:
* Main entry point: [main.py](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-backend/main.py)
* API routes: [routes.py](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-backend/app/routes.py)
* Pydantic schemas: [schemas.py](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-backend/app/schemas.py)
* ML Classifier Integration: [models.py](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-backend/app/models.py)
* Pre-trained ML Models Folder: [models](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-backend/models)

---

## 2. Data Models (Schemas)

The schemas in [schemas.py](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-backend/app/schemas.py) are extended to support both single email predictions and CSV batch email predictions.

### 2.1. Single Email Prediction Schemas
* `ModelPrediction`: Individual model predictions (`label`, `confidence`, `spam_probability`, `ham_probability`).
* `SentencePrediction`: Sentence-level breakdowns mapping model identifiers to predictions.
* `PredictionResult`: Overall models map and the list of sentence predictions.
* `PredictionResponse`: Standard API wrapper.

### 2.2. CSV Batch Prediction Schemas

#### Spam Word Info: `SpamWordInfo`
Details of words frequently appearing in emails classified as spam.
```python
from pydantic import BaseModel, Field

class SpamWordInfo(BaseModel):
    word: str = Field(..., description="The word/token")
    percentage: float = Field(..., ge=0.0, le=100.0, description="Percentage of spam emails that contain this word")
    count: int = Field(..., description="Total frequency count of this word in spam emails")
```

#### Model Batch Summary: `ModelBatchSummary`
Holds classification counts for a specific model over the batch.
```python
class ModelBatchSummary(BaseModel):
    spam_count: int = Field(..., description="Number of emails classified as spam")
    ham_count: int = Field(..., description="Number of emails classified as ham")
```

#### CSV Prediction Result: `CsvPredictionResult`
Holds the summarized statistics for the batch.
```python
from typing import Dict, List

class CsvPredictionResult(BaseModel):
    total_emails: int = Field(..., description="Total number of valid email rows processed")
    model_summaries: Dict[str, ModelBatchSummary] = Field(..., description="Summaries of spam/ham counts for each of the 4 models")
    top_spam_words: List[SpamWordInfo] = Field(..., description="Top N spam trigger words found in emails classified as spam")
```

#### CSV Prediction Response: `CsvPredictionResponse`
Standard response wrapper for the CSV upload endpoint.
```python
from typing import Optional

class CsvPredictionResponse(BaseModel):
    success: bool = Field(..., description="Indicates if the batch processing succeeded")
    data: Optional[CsvPredictionResult] = Field(None, description="Summarized prediction results (null on failure)")
    error: Optional[str] = Field(None, description="Error message if the request failed")
```

---

## 3. Endpoints Overview

All endpoints are prefixed with `/api/v1` and exposed in [routes.py](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-backend/app/routes.py):

| Method | Endpoint | Description | Content-Type |
| :--- | :--- | :--- | :--- |
| **POST** | `/predict` | Classify single copy-paste email or file (.eml, .msg, .txt) | `multipart/form-data` |
| **POST** | `/predict/csv` | Classify batch of emails from an uploaded CSV file | `multipart/form-data` |

---

## 4. Endpoint Specifications

### 4.1. Single Prediction Endpoint: `POST /api/v1/predict`

* **Purpose**: Process either a copy-pasted email or an uploaded email file and compute predictions from all 4 models.
* **Request Header**: `Content-Type: multipart/form-data`
* **Request Fields**:
  * `file`: Optional File upload (`.eml`, `.msg`, or `.txt`).
  * `subject`: Optional string.
  * `body`: Optional string (Required if `file` is not provided).
  * `sender`: Optional string.
* **Example Request Representation**:
  * *Option A (Copy-Pasted Text)*:
    The frontend sends only the raw pasted text via the `body` field:
    ```text
    Congratulations! You have won a free ticket. Please click here to claim your reward. Let me know when you get this.
    ```
  * *Option B (Uploaded Eml File)*:
    The frontend uploads the email file via the `file` field using multipart encoding:
    ```text
    Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW
    
    ------WebKitFormBoundary7MA4YWxkTrZu0gW
    Content-Disposition: form-data; name="file"; filename="spam_email.eml"
    Content-Type: message/rfc822

    [Binary raw .eml file content here]
    ------WebKitFormBoundary7MA4YWxkTrZu0gW--
    ```
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

---

### 4.2. CSV Batch Prediction Endpoint: `POST /api/v1/predict/csv`
* **Purpose**: Accept an uploaded CSV file containing multiple email rows, process each row, compile classification counts for all models, and run frequency analysis on words appearing in spam emails.
* **Request Header**: `Content-Type: multipart/form-data`
* **Request Fields**:
  * `file`: Uploaded file binary (must be a `.csv` file).
  * `top_n`: Optional integer query parameter (default: `10`). Defines the number of top spam words to return.
* **Example Multipart Request Representation**:
  Sent as a multipart binary CSV file upload (with optional query parameter `?top_n=10`):
  ```text
  Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW
  
  ------WebKitFormBoundary7MA4YWxkTrZu0gW
  Content-Disposition: form-data; name="file"; filename="emails.csv"
  Content-Type: text/csv

  subject,body
  "Urgent","Congratulations! You have won a prize."
  "Meeting","Are we still meeting at 3 PM today?"
  "Offer","Get cheap drugs online now."
  ------WebKitFormBoundary7MA4YWxkTrZu0gW--
  ```
* **Processing Flow**:
  1. **Validation**: Check if `file` is provided and has a `.csv` extension. If invalid, return a `400 Bad Request`.
  2. **CSV Parsing**:
     * Read the CSV file content using Python's standard `csv` library.
     * Locate columns named `subject` (optional) and `body` (required). If the `body` column is missing, return a `400 Bad Request` with an appropriate error.
     * Filter out empty rows.
  3. **Batch Prediction**:
     * Initialize count accumulators (`spam_count`, `ham_count`) to `0` for all 4 models.
     * For each valid row:
       * Feed the `body` text to the 4 classifiers (`naive_bayes`, `k_means`, `logistic_regression`, `linear_svm`).
       * Update the respective model's spam/ham counters based on the predicted labels.
  4. **Spam Keyword Extraction (Top Spam Words)**:
     * *Defining Spam Emails*: Identify rows classified as spam. To ensure quality, a row is defined as spam if the **Naive Bayes** model classifies it as spam (or, alternatively, if the majority of the 4 models classify it as spam).
     * *Tokenization*: For each classified spam email, split the `body` text into lowercase words.
     * *Stopword Filtering*: Exclude common English stopwords (e.g., *"the"*, *"and"*, *"a"*, *"of"*, *"to"*, *"in"*, *"is"*, *"you"*, *"it"*).
     * *Word Frequencies*: Calculate the number of spam emails in which each word appears.
     * *Percentage Formula*:
       $$\text{percentage} = \left(\frac{\text{Number of spam emails containing the word}}{\text{Total number of spam emails}}\right) \times 100$$
     * *Sorting*: Sort words by occurrence count descending, and take the top `top_n` (e.g. 10) words.
  5. **Response**: Construct and return `CsvPredictionResponse`.

* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "total_emails": 150,
      "model_summaries": {
        "naive_bayes": {
          "spam_count": 65,
          "ham_count": 85
        },
        "k_means": {
          "spam_count": 58,
          "ham_count": 92
        },
        "logistic_regression": {
          "spam_count": 62,
          "ham_count": 88
        },
        "linear_svm": {
          "spam_count": 64,
          "ham_count": 86
        }
      },
      "top_spam_words": [
        {
          "word": "free",
          "percentage": 84.6,
          "count": 55
        },
        {
          "word": "winner",
          "percentage": 69.2,
          "count": 45
        },
        {
          "word": "claim",
          "percentage": 61.5,
          "count": 40
        },
        {
          "word": "urgent",
          "percentage": 53.8,
          "count": 35
        },
        {
          "word": "offer",
          "percentage": 49.2,
          "count": 32
        },
        {
          "word": "click",
          "percentage": 46.2,
          "count": 30
        },
        {
          "word": "prize",
          "percentage": 43.1,
          "count": 28
        },
        {
          "word": "guaranteed",
          "percentage": 38.5,
          "count": 25
        },
        {
          "word": "cash",
          "percentage": 35.4,
          "count": 23
        },
        {
          "word": "reply",
          "percentage": 30.8,
          "count": 20
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
    "error": "CSV file is missing the required 'body' column."
  }
  ```
