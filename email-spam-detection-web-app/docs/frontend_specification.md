# Frontend Web App Specification

This document details the UI/UX and client-side logic specifications for the `email-spam-detection-web-app` application. The application is built using [React 19](https://react.dev/), [Vite](https://vite.dev/), and [Material UI (MUI) v9](https://mui.com/).

The application is structured as a **two-page web app**:
1. **Home Page (`/`)**: A landing page presenting information about the system, the machine learning models used, an "About Us" section, and a primary call-to-action button.
2. **Email Checker Page (`/spam-check`)**: The target page containing single email predictions (via text/file upload) and CSV batch prediction capabilities.

---

## 1. Directory Structure & Files

The frontend specification relates to the following files:
* App Entry and Routing: [main.jsx](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-web-app/src/main.jsx)
* Navigation and Header layout: [RootLayout.jsx](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-web-app/src/layouts/RootLayout.jsx)
* Home & Landing Page: [HomePage.jsx](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-web-app/src/pages/HomePage.jsx)
* Email Checker Page: [SpamCheckPage.jsx](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-web-app/src/pages/SpamCheckPage.jsx)

---

## 2. Navigation & Header Layout

The global navigation resides in [RootLayout.jsx](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-web-app/src/layouts/RootLayout.jsx):
* **Logo/Title**: "Spam Detector" (aligns left, redirects to `/`).
* **Navigation Links**:
  * **Home** (redirects to `/`)
  * **Email Checker** (redirects to `/spam-check`)
* **Styling**: Sleek modern app bar with an active-state indicator on links. The navigation link to "/about" is removed as the about content is unified into the home page.

---

## 3. Home Page Specification (`/`)

The [HomePage.jsx](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-web-app/src/pages/HomePage.jsx) serves as the landing page, introducing users to the email spam detection platform. It is structured into three primary visual sections:

### 3.1. Hero Section (Call to Action)
* **Purpose**: Welcome users and provide immediate access to the email classification dashboard.
* **Layout**: Large centered panel featuring:
  * **Heading**: High-impact title (e.g. "AI-Powered Email Spam & Phishing Classifier").
  * **Description**: Brief, compelling paragraph explaining that the tool uses multiple ML models to predict spam probability in real time (for copy-pasted text, file uploads, or CSV batches).
  * **Call to Action (CTA) Button**: A prominent `<Button variant="contained" size="large">` styled with high-contrast colors and hover effects that navigates the user to `/spam-check` when clicked.

### 3.2. Machine Learning Algorithms & Training Section
* **Purpose**: Educate users on the predictive methods and pipeline details.
* **Layout**: A responsive `<Grid container>` displaying cards for each of the four trained algorithms:
  1. **Naive Bayes (`naive_bayes`)**: Probabilistic model estimating word-occurrence spam likelihoods.
  2. **K-Means Clustering (`k_means`)**: Unsupervised model grouping similar emails based on centroid distances.
  3. **Logistic Regression (`logistic_regression`)**: Linear classifier modeling spam probability using extracted numeric features.
  4. **Linear SVM (`linear_svm`)**: Support Vector Machine maximizing spacing between spam and safe bounds.
* **Feature Engineering Card**: Summarizes the feature extraction process:
  * Combined pipeline using a `ColumnTransformer` with **TF-IDF Vectorization** (up to 50k tokens) and **9 custom numeric features** (URL frequency, exclamation/question counts, capitalization ratios, emojis count, numbers count, etc.).

### 3.3. About Us / Project Mission Section
* **Purpose**: Present details regarding the project context, team members, development background, and goals.
* **Layout**: Clean, full-width `<Paper>` section containing:
  * **Our Mission**: Text describing the goal of protecting user communication channels from malicious phishing attempts.
  * **Project Background**: Institutional details (e.g., COS30049 - Cloud Computing, Swinburne University of Technology).
  * **Team Section**: A 3-column responsive layout (`<Grid container spacing={3}>`) displaying cards for the 3 team members:
    1. **Lead AI Engineer**:
       * Name: John Doe
       * Avatar: Placeholder profile image or icon
       * Info: Responsible for model selection, training classifiers, and tuning pipeline performance.
    2. **Frontend Developer**:
       * Name: Jane Smith
       * Avatar: Placeholder profile image or icon
       * Info: Responsible for building the responsive React dashboard, theme integration, and interactive Heatmap.
    3. **Backend Developer**:
       * Name: Alex Johnson
       * Avatar: Placeholder profile image or icon
       * Info: Responsible for API endpoints, file upload integration, and CSV batch prediction parsing.

---

## 4. UI Component Specifications (Email Checker Page)

The [SpamCheckPage.jsx](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-web-app/src/pages/SpamCheckPage.jsx) contains a central card supporting three input tabs:
* **Tab 1: Raw Text Paste** (Single Email)
* **Tab 2: Single File Upload** (Single Email: `.eml`, `.msg`, `.txt`)
* **Tab 3: CSV Batch Upload** (Multiple Emails: `.csv`)

### 4.1. Main Input Card (`<Card sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 3 }}>`)
Contains standard MUI `<Tabs>` and a unified submit section.

#### Tab 1: Raw Text Paste
* Contains a single, large multi-line text input field.
* **Component**: `<TextField label="Paste Raw Email Text (Required)" multiline rows={12} required fullWidth sx={{ mt: 2 }} />`
* **Behavior**: Users copy and paste the entire email body (or raw header + body text) into this single input box. Only the `body` field is populated in the request payload.

#### Tab 2: Single File Upload
* Contains a dashed dropzone for individual email files.
* **Component**: `<Box sx={{ border: '2px dashed #90caf9', borderRadius: 2, p: 4, mt: 2, textAlign: 'center', cursor: 'pointer' }}>`
* **Constraints**: Accepts `.eml`, `.msg`, and `.txt` files.
* **Selected File Badge**: Displays an icon, the filename, and a clear button to reset the file.

#### Tab 3: CSV Batch Upload
* Contains a dashed dropzone for multiple-email spreadsheets.
* **Component**: `<Box sx={{ border: '2px dashed #90caf9', borderRadius: 2, p: 4, mt: 2, textAlign: 'center', cursor: 'pointer' }}>`
* **Constraints**: Accepts `.csv` files.
* **Top N Keywords Selector**: A number field (`<TextField type="number" />`) or select dropdown allowing the user to select how many top spam words to retrieve (default: `10`, range: `5` to `30`).

#### Action Bar
* **Button**: An "Analyze Content" Button (`<Button variant="contained" size="large" fullWidth>`).
* **Loading indicator**: Shows a circular progress spinner when `isLoading` is true.

---

## 5. Dashboards (Conditional Rendering)

Depending on the tab used to submit the request, the page displays one of two dashboard layouts:

### 5.1. Dashboard A: Single Email Dashboard (Used for Tab 1 & Tab 2)

#### 5.1.1. Model Selection Card
* Displays a side-by-side comparative grid showing the overall classification result for each model:
  * Naive Bayes, K-Means, Logistic Regression, and Linear SVM.
* **Interactive Selector**: A `<ToggleButtonGroup>` or `<Select>` element allows the user to choose the **Active Classifier** to load in the sentence heatmap.

#### 5.1.2. Active Model Overall Result Card
* Displays the overall verdict for the selected model:
  * **Classification Badge**: "CLASSIFIED AS SPAM" (Red) or "CLASSIFIED AS SAFE (HAM)" (Green).
  * **Confidence Gauge**: A `<CircularProgress>` widget showing the percentage of confidence.

#### 5.1.3. Sentence-Level Interactive Heatmap
* **Heatmap Container**: A `<Paper>` block displaying the email body split into sentences.
* **Highlight Threshold Slider**: A slider from 0% to 100%. Only sentences with a spam probability under the active model $\ge$ threshold are highlighted.
* **Sentence Highlights**: Wrapped in inline `<span>` tags with background color opacity proportional to the spam probability.
* **Tooltip**: Hovering over a sentence reveals the active model's exact spam probability.
* **Detailed Drawer**: Clicking a sentence slides open a side Drawer showing the full sentence text and a comparison of all 4 models' probabilities.

---

### 5.2. Dashboard B: CSV Batch Summary Dashboard (Used for Tab 3)

#### 5.2.1. Processed Count Banner
* A large card stating the total number of processed email rows (e.g. `"Total Emails Processed: 150"`).

#### 5.2.2. Multi-Model Distribution Grid
* Renders 4 summary cards (one for each model) showing counts of spam vs. ham.
* Each card includes the model name and a linear progress bar indicating the spam (red) vs. ham (green) ratio.
  * *Example (Naive Bayes Card)*: Spam: 65 (43.3%) | Ham: 85 (56.7%).

#### 5.2.3. Top Spam Keywords Visualizer
* Renders a list of the top $N$ spam words.
* For each word, displays a horizontal progress bar matching its percentage occurrence in spam emails, alongside the raw frequency.
  * *Example*: **"free"** `[████████░░░░] 84.6% (55 count)`

---

## 6. API Integration & Data Flow

### 6.1. Submit Single Email (Text / Single File)
* **Endpoint**: `POST http://localhost:8000/api/v1/predict`
* **Javascript Fetch Implementation**:
```javascript
async function analyzeSingleEmail({ activeTab, pastedEmailText, file }) {
  const formData = new FormData();

  if (activeTab === 0) {
    formData.append("body", pastedEmailText);
  } else if (activeTab === 1 && file) {
    formData.append("file", file);
  } else {
    throw new Error("Missing input.");
  }

  const response = await fetch("http://localhost:8000/api/v1/predict", {
    method: "POST",
    body: formData
  });
  return await response.json();
}
```

### 6.2. Submit CSV File (Batch)
* **Endpoint**: `POST http://localhost:8000/api/v1/predict/csv`
* **Javascript Fetch Implementation**:
```javascript
async function analyzeCsvBatch(file, topN = 10) {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await fetch(`http://localhost:8000/api/v1/predict/csv?top_n=${topN}`, {
    method: "POST",
    body: formData
  });
  return await response.json();
}
```

---

## 7. State Management Blueprint

The React state in [SpamCheckPage.jsx](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-web-app/src/pages/SpamCheckPage.jsx) manages:
* **`activeTab`**: Selected input tab (0: Paste, 1: Eml/Msg/Txt file, 2: CSV file).
* **`pastedEmailText`**: Text area string for pasted text.
* **`selectedSingleFile`**: Single file object.
* **`selectedCsvFile`**: CSV file object.
* **`topNWords`**: Number of words to return (default: `10`).
* **`isLoading`**: API request loading status.
* **`singleAnalysisResult`**: JSON response from `/predict` (or `null`).
* **`csvAnalysisResult`**: JSON response from `/predict/csv` (or `null`).
* **`selectedModel`**: Selected model key for visual heatmap highlights (`'naive_bayes'`, etc.).
* **`highlightThreshold`**: Heatmap threshold slider value (0 to 100).
* **`selectedSentence`**: Active clicked sentence details.
* **`errorMessage`**: SnackBar error message status.
