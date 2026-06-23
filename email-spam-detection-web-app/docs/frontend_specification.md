# Frontend Web App Specification

This document details the UI/UX and client-side logic specifications for the `email-spam-detection-web-app` application. The application is built using [React 19](https://react.dev/), [Vite](https://vite.dev/), and [Material UI (MUI) v9](https://mui.com/).

The frontend enables the user to:
1. Paste raw text emails or upload single email files (`.eml`, `.msg`, `.txt`) to analyze sentence-by-sentence.
2. Upload a CSV file (`.csv`) containing multiple emails to perform a batch prediction and analyze aggregate results across all four models.
3. Visualize spam/ham counts for each classifier and discover the top $N$ spam keywords with their percentage occurrence rates.

---

## 1. Directory Structure & Files

The frontend specification relates to the following files:
* App Entry and Routing: [main.jsx](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-web-app/src/main.jsx)
* Navigation and Header layout: [RootLayout.jsx](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-web-app/src/layouts/RootLayout.jsx)
* Target Prediction Page: [SpamCheckPage.jsx](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-web-app/src/pages/SpamCheckPage.jsx)

---

## 2. Page Navigation and Input States

The [SpamCheckPage.jsx](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-web-app/src/pages/SpamCheckPage.jsx) contains a central card supporting three input tabs:
* **Tab 1: Raw Text Paste** (Single Email)
* **Tab 2: Single File Upload** (Single Email: `.eml`, `.msg`, `.txt`)
* **Tab 3: CSV Batch Upload** (Multiple Emails: `.csv`)

---

## 3. UI Component Specifications

### 3.1. CSV Batch Upload Tab (Tab 3)
* **CSV File Dropzone**:
  * A styled drop container (`<Box>`) that accepts only `.csv` uploads.
  * Shows filename, size, and row count preview (optional) once selected.
* **Top N Keywords Selector**:
  * A dropdown or number selector (`<TextField type="number">` or `<Select>`) allowing the user to specify how many top spam words to return (default: `10`, range: `5` to `30`).
* **Analyze Button**:
  * Triggers the CSV upload endpoint and shows a loading state.

### 3.2. Dashboards (Conditional Rendering)

Depending on the upload source, the frontend renders one of two dashboard interfaces:
* **Dashboard A: Single Email Dashboard** (Used for Tab 1 and Tab 2)
* **Dashboard B: CSV Batch Summary Dashboard** (Used for Tab 3)

---

## 4. CSV Batch Summary Dashboard (NEW)

When a CSV file is successfully processed, the frontend renders the following components:

### 4.1. processed Count Card
* A clean statistics display showing the total number of emails analyzed in the batch.
  * *Example*: `"Total Emails Processed: 150"`

### 4.2. Multi-Model Distribution Grid
* Shows a side-by-side comparison of spam and ham classifications for each model:
  * Rendered as 4 visual cards (one for each model: `naive_bayes`, `k_means`, `logistic_regression`, `linear_svm`).
  * Each card displays the model name, a progress bar/visual representation of the division between spam vs. ham, and the exact count/percentage breakdown.
  * *Example for Naive Bayes Card*:
    * **Spam**: 65 emails (43.3%) — colored red
    * **Ham**: 85 emails (56.7%) — colored green
    * Visual linear progress bar showing red/green division.

### 4.3. Top Spam Keywords Visualizer
* Displays the list of top $N$ spam words returned by the API (`top_spam_words`).
* For each keyword, render:
  * The word itself (bold, e.g., **"free"**).
  * A horizontal progress bar representing the percentage of spam emails containing that word.
  * The percentage label and raw count (e.g., `84.6% (55 occurrences)`).
  * Hovering over the bar shows a tooltip: *"Keyword 'free' appeared in 55 out of 65 spam-classified emails."*

---

## 5. API Integration & Data Flow

Communication with the FastAPI backend utilizes two distinct fetch methods.

### 5.1. Submit Single Email (Text / File)
* Endpoint: `POST http://localhost:8000/api/v1/predict`
* Content-Type: `multipart/form-data`

### 5.2. Submit CSV File (Batch)
* Endpoint: `POST http://localhost:8000/api/v1/predict/csv`
* Content-Type: `multipart/form-data`
* Code Blueprint:
```javascript
async function analyzeCsvBatch(file, topN = 10) {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await fetch(`http://localhost:8000/api/v1/predict/csv?top_n=${topN}`, {
    method: "POST",
    body: formData // Browser sets Content-Type boundary automatically
  });

  return await response.json();
}
```

---

## 6. State Management Blueprint

The React state in [SpamCheckPage.jsx](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-web-app/src/pages/SpamCheckPage.jsx) manages:
* **`activeTab`**: `0` (Text), `1` (Single File), or `2` (CSV File).
* **`sender` / `subject` / `body`**: Form input values for single text paste.
* **`selectedSingleFile`**: Single file object (for `.eml`, `.msg`, `.txt`).
* **`selectedCsvFile`**: CSV file object (for `.csv`).
* **`topNWords`**: Number of words to return (default: `10`).
* **`isLoading`**: Boolean network request indicator.
* **`singleAnalysisResult`**: Results object returned from single email analysis (or `null`).
* **`csvAnalysisResult`**: Results object returned from CSV batch analysis (or `null`).
* **`selectedModel`**: Active single classifier identifier (`'naive_bayes'`, etc.).
* **`highlightThreshold`**: Threshold slider value (0 to 100).
* **`selectedSentence`**: Active clicked sentence object.
* **`errorMessage`**: Error feedback indicator.
