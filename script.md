# 🛡️ COS30049 Assignment 3 - Video Presentation Script (15 Minutes)

This script outlines the video presentation for the **AI-Powered Email Spam Detector** project. It is structured for **three team members**, dividing the presentation into three equal 5-minute blocks covering the **Application Demo (User Side)**, the **Backend & AI Architecture**, and the **Frontend & Visualizations**. 

> [!NOTE]
> This presentation is conducted entirely using a **Live Web Browser Demo** and the **Code Editor (VS Code)**. No slideshow presentation slides are used.

---

## ⏱️ Video Breakdown at a Glance

```mermaid
gantt
    title 15-Minute Video Presentation Timeline
    dateFormat  m
    axisFormat %M:%S
    
    section Member 3: User Side
    Live Demo: Introduction    :active, m1, 0, 1.5m
    Live Demo: Single Email     :m2, after m1, 2m
    Live Demo: Batch CSV & PDF  :m3, after m2, 1.5m
    
    section Member 2: Backend
    Code Editor: API Surface    :active, m4, 5m, 1.5m
    Code Editor: Preprocessing  :m5, after m4, 2m
    Code Editor: ML inference   :m6, after m5, 1.5m
    
    section Member 1: Frontend
    Code Editor: UI Structure   :active, m7, 10m, 1.5m
    Code & Demo: D3.js Charts   :m8, after m7, 2.5m
    Demo: Export & Wrap-up      :m9, after m8, 1m
```

---

## 🎙️ Section 1: Application Walkthrough & User Experience (0:00 - 5:00)
**Presenter:** Member 3 (The Application & User Perspective)
**Focus:** Project introduction, core problem statement, and live interactive feature demonstration.

### 🎥 1.1 Intro & Context (0:00 - 1:30)
* **On Screen:** Live web browser displaying the Web App Home Page (`http://localhost:80`). Hovering over the project title and team members section at the bottom.
* **Key Speaking Points:**
  * **Introduction:** Welcome assessors and introduce the team and assignment scope.
  * **The Problem:** Modern email phishing/spam attacks are increasingly complex; simple keyword matches are insufficient.
  * **The Goal:** Build an intuitive full-stack system that classifies emails and provides explainable metrics for security analysts.
  * **High-Level Solution:** Multi-model detection via FastAPI combined with an interactive D3.js visualization dashboard in React.

---

### 🎥 1.2 Single Email Analysis Demo (1:30 - 3:30)
* **On Screen:** In the live web browser, click on the "Email Checker" navigation link. Paste a sample spam email text (e.g., *“URGENT! Your account has been suspended! Click http://phish-link.com to verify your details and claim $1000 cash!!”*). Click 'Analyze'. Show the empty state, then the loaded result.
* **Key Speaking Points:**
  * **Interface Navigation:** Show the clean entry point and state-free workspace.
  * **Input Methods:** Highlight text pasting, as well as file upload zones supporting standard `.eml`, `.msg`, and `.txt` files.
  * **Real-time Prediction:** Click 'Analyze' to trigger API calls and load results.
  * **Multi-Model Consensus:** Show the overall spam/ham assessment and the comparison switcher (instantly compare Naive Bayes, K-Means, Logistic Regression, and Linear SVM).

---

### 🎥 1.3 Batch CSV Analysis & Report Exporting (3:30 - 5:00)
* **On Screen:** Click clear. Switch to the file upload section. Upload a CSV file containing hundreds of emails. The screen loads the Batch Dashboard displaying the consensus stream graph, bar charts, and word cloud. Click the "Export Report" button and show the printed PDF/PNG.
* **Key Speaking Points:**
  * **Batch Analysis:** Demonstrate uploading a CSV containing multiple records for bulk spam triage.
  * **Aggregated Visuals:** Explain the batch summary metrics (consensuses, stream graphs showing model alignment over records, word cloud indicating most common spam terms).
  * **Reporting:** Demonstrate the "Export Report" button which exports a print-ready PDF/PNG containing the charts and results.
  * **Handover:** Seamlessly hand the presentation to Member 2 to cover backend architecture.

---

## 🎙️ Section 2: Backend Architecture & AI Pipeline (5:00 - 10:00)
**Presenter:** Member 2 (The Backend Developer)
**Focus:** FastAPI API surface, text parsing utilities, feature extraction pipeline, and model probability adapters.

### 🎥 2.1 Technical Tech Stack & API Design (5:00 - 6:30)
* **On Screen:** Code editor displaying [docker-compose.yml](file:///Users/showwaiyan/Dev/cos30049-assignment3/docker-compose.yml) to show backend containerization, followed by [main.py](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-backend/main.py) and [routes.py](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-backend/app/routes.py).
* **Key Speaking Points:**
  * **Backend Stack:** FastAPI framework chosen for asynchronous speed, run via Uvicorn and fully containerized with Docker.
  * **API Routes Overview:**
    * `POST /api/v1/predict` (Single email body / upload file evaluation).
    - `POST /api/v1/predict/csv` (Batch CSV processing & aggregation).
    - `POST /api/v1/predict/sentence` (Granular sentence prediction breakdown).
  * **Email Parsing Utility:** Walk through how `.eml` and `.msg` uploads are stored in a temporary path, parsed using the standard `email` library to extract body/subject metadata, and cleaned up safely.

---

### 🎥 2.2 Text Preprocessing & Feature Engineering (6:30 - 8:30)
* **On Screen:** Code editor showing [utils.py](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-backend/app/utils.py). Scroll through the `TextPreprocessor` methods (HTML tag stripping, lemmatization, stopword removal) and the `extract_features` function.
* **Key Speaking Points:**
  * **NLP Preprocessing:** NLTK cleaning pipeline: HTML tag stripping, regex substitutions for normalization, English stopword removal, and WordNet lemmatization.
  * **Feature Engineering (9 Custom Features):** Highlight the code for the numeric feature count extractors:
    1. URL frequency counts (`https?://\S+|www\.\S+`).
    2. Exclamations, questions, and dollar sign frequency counts.
    3. All-caps word counts and raw digit sequence count.
    4. Letter case capitalization ratio.
    5. Emoji count (using `emoji.emoji_count`).
  * **Vectorization:** TF-IDF vectorization combined with numeric features to form the complete input matrix for model inference.

---

### 🎥 2.3 Machine Learning Models & Probability Scaling (8:30 - 10:00)
* **On Screen:** Code editor displaying [models.py](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-backend/app/models.py). Scroll down to the `MultiModelClassifier` methods, specifically highlighting `predict_linear_svm` and `predict_kmeans`.
* **Key Speaking Points:**
  * **Lifespan Model Loading:** Models loaded from disk (`.pkl` pipelines) on app startup using `joblib`.
  * **Standardizing Outputs:** Custom prediction adapter methods used to unify outputs across models:
    * *Naive Bayes & Logistic Regression:* standard `predict_proba`.
    * *K-Means:* Custom distance conversion where closer proximity to a spam centroid yields higher pseudo-probability.
    * *Linear SVM:* Scaling margin output from `decision_function` through a Sigmoid activation to output a standard probability.
  * **Handover:** Hand the presentation to Member 1 to explain the user interface and visualization rendering.

---

## 🎙️ Section 3: Frontend Architecture & Data Visualizations (10:00 - 15:00)
**Presenter:** Member 1 (The Frontend Developer)
**Focus:** React + MUI architecture, D3.js custom charts, sentence heatmap, and PDF CSS styling.

### 🎥 3.1 React Architecture & Styling (10:00 - 11:30)
* **On Screen:** Code editor displaying [main.jsx](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-web-app/src/main.jsx) showing the Material-UI custom theme setup and router, then highlight the files inside the `src/pages` directory in the side bar.
* **Key Speaking Points:**
  * **Frontend Stack:** React application bundled with Vite for fast client-side loading.
  * **UI Kit & Design:** Material-UI (MUI) custom theme using the 'Manrope' font, custom slate/slate-gray palette, and responsive spacing.
  * **Page Routing Structure:** RootLayout (global shell/nav bar), HomePage (details and SharePoint link), and state-heavy SpamCheckPage (orchestrates file uploads, API fetches, and visualization states).

---

### 🎥 3.2 D3.js Custom Visualizations (11:30 - 14:00)
* **On Screen:** Switch between the code editor showing [SpamCheckPage.jsx](file:///Users/showwaiyan/Dev/cos30049-assignment3/email-spam-detection-web-app/src/pages/SpamCheckPage.jsx) (specifically showing `FeatureRadarChart` and `SentenceHeatmap` code segments) and the live browser demonstrating the hover behaviors and tooltip activations.
* **Key Speaking Points:**
  * **Explainable AI with D3.js:** SVGs manipulated directly with D3 selection bindings, avoiding standard high-level graphing packages.
  * **Feature Radar Chart:** Renders the 9 features on 9 radial axes, comparing current email feature values against average spam/ham ratios. Features include interactive hover tooltips.
  * **Sentence Spam Heatmap:** Breaks down text block into sentences, highlights them using CSS opacity based on model spam scoring. Hovering updates a sub-card showing local metrics.
  * **Batch Dashboard Visuals:**
    * *Grouped Bar Chart:* Multi-model performance comparisons.
    * *Stream Graph:* Multi-class confidence margins across chronological batch records.
    * *Word Cloud:* Summary of prominent keywords found in identified spam records.

---

### 🎥 3.3 Print Layout and Conclusion (14:00 - 15:00)
* **On Screen:** Code editor showing the CSS `@media print` layout section in `index.css` or `SpamCheckPage.jsx`, then switch to the web browser to show the printed PDF report preview. Show [README.md](file:///Users/showwaiyan/Dev/cos30049-assignment3/README.md) in the code editor for final remarks.
* **Key Speaking Points:**
  * **Export Layout Integrity:** Detailed custom print stylesheets (`@media print`) configured to dynamically hide sidebar elements, scale SVG widths, and prevent layout cutting or page breaks inside tables.
  * **Key Takeaways:** Project demonstrates integration of robust backend ML models with customized, explanatory frontend SVGs.
  * **Wrap-up:** Concluding statements on behalf of the team; opening the floor for assessor questions.

---

## 💡 Practical Recording Tips for the Team

1. **Keep the Transitions Smooth**: Practice passing the mic. E.g., *"Now, I will hand it over to Member 2..."*
2. **Synchronize Scrolling with Speech**: When Member 2 talks about preprocessing or probability calculations, make sure the screencast displays that exact code in VS Code.
3. **Use a High-Quality Mic**: Ensure the volume is consistent across all three members.
4. **Interactive Demo**: During the demo in Section 1, make sure to use a realistic spam email text and file so that the radar chart looks active and shows notable deviations.
