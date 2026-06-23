# Frontend Web App Specification

This document details the UI/UX and client-side logic specifications for the `email-spam-detection-web-app` application. The application is built using [React 19](https://react.dev/), [Vite](https://vite.dev/), and [Material UI (MUI) v9](https://mui.com/).

The frontend enables the user to:
1. Paste raw text emails (Subject, Sender, and Body) or drag-and-drop/upload exported email files (.eml, .msg, .txt) using a single, consolidated submission endpoint.
2. Visualize overall classification results (Spam vs. Ham classification percentage).
3. Interactively view individual sentences in the email highlighted by their spam probability with an adjustable threshold slider and detailed tooltip indicators.

---

## 1. Directory Structure & Files

The frontend specification relates to the following files:
* App Entry and Routing: [main.jsx](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-web-app/src/main.jsx)
* Navigation and Header layout: [RootLayout.jsx](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-web-app/src/layouts/RootLayout.jsx)
* Target Prediction Page: [SpamCheckPage.jsx](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-web-app/src/pages/SpamCheckPage.jsx)

---

## 2. Design Justification: Sentence-Level Highlights

Instead of highlighting words individually, the UI highlights **sentences** for the following reasons:
* **Context Preservation**: Word-by-word classification has low accuracy because the meaning of words depends on the sentence context (e.g., *"free"* in *"feel free"* vs *"free lottery"*). Highlighting sentences reflects correct machine learning classification contexts.
* **UX Cleanliness**: Highlighting whole sentences is far easier for a user to read. Highlighting word-by-word would produce a visually cluttered, pixelated UI.
* **Performance**: Segmenting by sentences leads to smaller payload structures and faster client-side rendering.

---

## 3. UI Component Specifications

### 3.1. Input Section
A container card (`<Card sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 3 }}>`) containing:
* **MUI Tabs (`<Tabs>` and `<Tab>`)**:
  * **Tab 1: Raw Text Paste**
    * Field `Sender`: Text input (`<TextField label="Sender Address (Optional)" fullWidth sx={{ mb: 2 }} />`)
    * Field `Subject`: Text input (`<TextField label="Email Subject (Optional)" fullWidth sx={{ mb: 2 }} />`)
    * Field `Body`: Multi-line Text input (`<TextField label="Email Content (Required)" multiline rows={8} required fullWidth sx={{ mb: 2 }} />`)
  * **Tab 2: File Upload**
    * A custom dropzone box (`<Box sx={{ border: '2px dashed #90caf9', borderRadius: 2, p: 4, textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>`)
    * Prompt: "Drag and drop your .eml, .msg, or .txt file here, or click to browse"
    * Accept types: `.eml`, `.msg`, `.txt`
    * Selected File Indicator: If a file is selected, show an icon representing the file format, the filename, file size, and a `<IconButton color="error">` (Trash icon) to remove or clear the selected file.
* **Submit Action Button**:
  * An "Analyze Email" Button (`<Button variant="contained" size="large" fullWidth>`).
  * If a request is in progress, disable the button and show a `<CircularProgress size={24} />` inside or a full skeleton loader below it.

### 3.2. Analysis Dashboard
When prediction results are successfully retrieved from the API, render the following layout:

#### Section 3.2.1. Overall Result Card
* A styled `<Card>` displaying:
  * **Classification Badge**: Rendered in a bold font.
    * If `label === "spam"`: Display "CLASSIFIED AS SPAM" in deep red (`error.main`).
    * If `label === "ham"`: Display "CLASSIFIED AS SAFE (HAM)" in rich green (`success.main`).
  * **Confidence score widget**: A visual circular progress indicator (`<CircularProgress variant="determinate" value={confidence * 100} color={label === 'spam' ? 'error' : 'success'} />`) with a text overlay centered inside displaying the exact percentage (e.g. `92%`).
  * **Metadata breakdown**: Displays the extracted/provided Sender and Subject.

#### Section 3.2.2. Sentence-Level Interactive Heatmap (User Story 2)
* **Heatmap Container**: A `<Paper sx={{ p: 3, mt: 3, lineHeight: 1.8 }}>` rendering the sentences inline.
* **Highlight Threshold Slider**:
  * A slider widget (`<Slider min={0} max={100} value={threshold} onChange={...} />`) placed above the text block.
  * Label: "Filter sentences by Spam Score Threshold: >= X%".
  * Purpose: Only highlight sentences where `spam_probability * 100` is greater than or equal to the slider's value. This allows users to easily filter and focus on highly suspicious sentences.
* **Inline Sentence Highlights**:
  * Map through `data.sentences`. For each sentence object:
    1. Render a styled standard HTML `<span>` tag.
    2. Apply dynamic styling for the background color based on the individual sentence probability and the active slider threshold.
    3. **Color Formula**:
       * If sentence's `spam_probability * 100 >= threshold` and `label === 'spam'`:
         * `background: rgba(239, 83, 80, ${sentence.spam_probability * 0.45})` (Light red overlay proportional to probability)
         * `borderBottom: "2px solid #ef5350"` (Accent bottom border)
       * If sentence's `spam_probability * 100 < threshold` or is classified as ham:
         * Keep background transparent or use a very soft safe green indicator if desired: `rgba(76, 175, 80, 0.08)`.
    4. **Hover Interaction**:
       * Wrap the `<span>` in a MUI `<Tooltip title={`Spam Probability: ${(s.spam_probability * 100).toFixed(1)}%`} arrow placement="top">`.
       * When hovered, slightly raise the opacity of the sentence background and change the cursor to a pointer (`cursor: "pointer"`).
    5. **Click Interaction**:
       * When a highlighted sentence is clicked, trigger a side Drawer or Detail Panel (`<Drawer anchor="right" open={drawerOpen} onClose={...}>`) that displays the exact details:
         * Full text of the selected sentence.
         * Pie chart or progress bars comparing Ham vs. Spam percentages.
         * Highlights of known spam trigger words (e.g. "free", "congratulations", "win", "click here") contained in the sentence.

---

## 4. API Integration & Data Flow

Communication with the FastAPI backend `/predict` endpoint uses a single network handler function that accepts either raw input details or an uploaded file, sending it as `multipart/form-data`.

### 4.1. Base Configuration
* API Base URL: `http://localhost:8000/api/v1`

### 4.2. Submit Function
```javascript
async function analyzeEmail({ activeTab, rawInput, file }) {
  const formData = new FormData();

  if (activeTab === 0) {
    // Send raw text fields
    formData.append("body", rawInput.body);
    if (rawInput.subject) formData.append("subject", rawInput.subject);
    if (rawInput.sender) formData.append("sender", rawInput.sender);
  } else if (activeTab === 1 && file) {
    // Send email file
    formData.append("file", file);
  } else {
    throw new Error("No input provided.");
  }

  const response = await fetch("http://localhost:8000/api/v1/predict", {
    method: "POST",
    body: formData // Browser sets Content-Type automatically for FormData
  });

  return await response.json();
}
```

---

## 5. State Management Blueprint

To implement the features seamlessly, the state inside `SpamCheckPage` should represent:
* **`activeTab`**: `0` (Text Input) or `1` (File Upload).
* **`sender` / `subject` / `body`**: Strings for form inputs.
* **`selectedFile`**: JavaScript `File` object (or `null`) for uploads.
* **`isLoading`**: Boolean for request pending state.
* **`analysisResult`**: The detailed `PredictionResponse` JSON object returned from the API (or `null`).
* **`highlightThreshold`**: Numeric value (0 to 100, default: `50`) controlling the visibility of spam sentence highlighting.
* **`selectedSentence`**: Sentence object (or `null`) for the detailed breakdown Drawer view.
* **`errorMessage`**: String (or `null`) for displaying snackbar or alert messages on failure.
