# Frontend Web App Specification

This document details the UI/UX and client-side logic specifications for the `email-spam-detection-web-app` application. The application is built using [React 19](https://react.dev/), [Vite](https://vite.dev/), and [Material UI (MUI) v9](https://mui.com/).

The frontend enables the user to:
1. Paste raw text emails (Subject, Sender, and Body) or drag-and-drop/upload exported email files (.eml, .msg, .txt).
2. Visualize and compare overall classification results from **four distinct machine learning classifiers** simultaneously (Naive Bayes, K-Means, Logistic Regression, Linear SVM).
3. Interactively view individual sentences in the email highlighted by their spam probability under any of the four models, with an adjustable threshold slider and detailed tooltip indicators.

---

## 1. Directory Structure & Files

The frontend specification relates to the following files:
* App Entry and Routing: [main.jsx](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-web-app/src/main.jsx)
* Navigation and Header layout: [RootLayout.jsx](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-web-app/src/layouts/RootLayout.jsx)
* Target Prediction Page: [SpamCheckPage.jsx](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-web-app/src/pages/SpamCheckPage.jsx)

---

## 2. Design Justification: Sentence-Level Highlights & Multi-Model Display

* **Sentence-Level Visualizations**: Highlighting whole sentences preserves grammatical context, makes classification probabilities significantly more accurate, and avoids a visually cluttered interface that would arise from word-by-word highlights.
* **Multi-Model Comparison**: To support comparison across the four classifiers (Naive Bayes, K-Means Clustering, Logistic Regression, Linear SVM), the results panel renders a summary table comparing the predictions side-by-side, along with a selector to switch the active sentence highlight overlay.

---

## 3. UI Component Specifications

### 3.1. Input Section (Unchanged)
A container card (`<Card sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 3 }}>`) containing:
* **MUI Tabs (`<Tabs>` and `<Tab>`)**:
  * **Tab 1: Raw Text Paste**: Form fields for `Sender` (optional), `Subject` (optional), and multi-line `Body` (required, 8+ rows).
  * **Tab 2: File Upload**: Drag-and-drop zone accepting `.eml`, `.msg`, and `.txt` files with file metadata indicators and a clear button.
* **Submit Button**: An "Analyze Email" Button (`<Button variant="contained">`) that sends data via `FormData` to the combined backend endpoint.

### 3.2. Analysis Dashboard
Displayed dynamically after successfully receiving the API response.

#### Section 3.2.1. Model Comparison Table & Active Selector
* A top card displaying a summary grid or table listing:
  * Classifier Model name
  * Prediction label (Spam / Ham)
  * Confidence rating (0% to 100%)
* **Model Selection Control**:
  * A `<ToggleButtonGroup>` or `<Select>` component allowing the user to select the **Active Model** to visualize in the sentence heatmap.
  * Options: `Naive Bayes` (`naive_bayes`), `K-Means Clustering` (`k_means`), `Logistic Regression` (`logistic_regression`), `Linear SVM` (`linear_svm`).
  * Default selected state: `naive_bayes`.

#### Section 3.2.2. Selected Model Overall Result Widget
* Based on the **Active Model** selection:
  * **Classification Badge**: E.g., "CLASSIFIED AS SPAM" in red (`error.main`) or "CLASSIFIED AS SAFE (HAM)" in green (`success.main`).
  * **Confidence score widget**: Circular progress gauge (`<CircularProgress value={confidence * 100} />`) displaying the active model's classification confidence.

#### Section 3.2.3. Sentence-Level Interactive Heatmap (User Story 2)
* **Heatmap Container**: A `<Paper>` block displaying the segmented email sentences inline.
* **Highlight Threshold Slider**:
  * A slider widget (`<Slider min={0} max={100} value={threshold} onChange={...} />`) to filter highlighted sentences.
  * Purpose: Highlight sentences only when their spam probability under the **Active Model** exceeds or meets the threshold.
* **Inline Sentence Highlights**:
  * Map through `data.sentences`. For each sentence segment:
    1. Retrieve the sentence prediction data corresponding to the selected active model: `sentence.models[selectedModel]`.
    2. Apply dynamic background coloring matching the active model's scores:
       * If active model's `spam_probability * 100 >= threshold` and its prediction is `spam`:
         * `background: rgba(239, 83, 80, ${sentence.models[selectedModel].spam_probability * 0.45})`
         * `borderBottom: "2px solid #ef5350"`
       * Otherwise, default to transparent or subtle safe green coloring.
    3. **Hover Interaction**: Wrap sentence in a `<Tooltip>` showing:
       * `[Model Name] Spam Risk: X%`
    4. **Click Interaction**: Displays a detailed side Drawer (`<Drawer>`) with:
       * Full sentence text.
       * Comparison list or chart of all 4 models' individual probability scores for that specific sentence.

---

## 4. API Integration & Data Flow

### 4.1. Submit Function (Unchanged)
The frontend submits either text or file data via a single `multipart/form-data` request to the backend:
```javascript
async function analyzeEmail({ activeTab, rawInput, file }) {
  const formData = new FormData();

  if (activeTab === 0) {
    formData.append("body", rawInput.body);
    if (rawInput.subject) formData.append("subject", rawInput.subject);
    if (rawInput.sender) formData.append("sender", rawInput.sender);
  } else if (activeTab === 1 && file) {
    formData.append("file", file);
  } else {
    throw new Error("No input provided.");
  }

  const response = await fetch("http://localhost:8000/api/v1/predict", {
    method: "POST",
    body: formData
  });

  return await response.json();
}
```

---

## 5. State Management Blueprint

The React state in [SpamCheckPage.jsx](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-web-app/src/pages/SpamCheckPage.jsx) manages:
* **`activeTab`**: Input selector (text vs. file).
* **`sender` / `subject` / `body`**: Form input state values.
* **`selectedFile`**: Uploaded file object.
* **`isLoading`**: Pending network state.
* **`analysisResult`**: Complete prediction response containing multi-model data.
* **`selectedModel`**: Active classifier key (e.g. `'naive_bayes'`, `'k_means'`, `'logistic_regression'`, `'linear_svm'`).
* **`highlightThreshold`**: Numeric value (0 to 100) for sentence overlays.
* **`selectedSentence`**: Active clicked sentence details for the sidebar.
* **`errorMessage`**: Error feedback indicator.
