# Frontend Development Task Breakdown

This document divides the frontend implementation of the Spam Detection Web App into three parallel tracks for a 3-member developer team. 

## 🧑‍💻 Developer 1: Application Shell & Landing Page
**Focus:** Routing, global layout, static content, and application entry points.

* **Task 1.1:** Setup routing in `main.jsx` and build the global navigation bar in `RootLayout.jsx` (including active link states and branding).
* **Task 1.2:** Build the **Hero Section** on `HomePage.jsx` with the high-impact title, platform description, and Call-to-Action button redirecting to the email checker.
* **Task 1.3:** Build the **Machine Learning Algorithms Section** grid on the Home Page to detail the 4 models (Naive Bayes, K-Means, Logistic Regression, Linear SVM) and the feature engineering pipeline.
* **Task 1.4:** Build the **About Us & Team Section** containing the project mission and the 3-column team member profile cards.

---

## 🧑‍💻 Developer 2: Input Forms & API Integration
**Focus:** User inputs, file uploads, state management, and connecting to the backend.

* **Task 2.1:** Set up the core state variables (e.g., `activeTab`, `isLoading`, `singleAnalysisResult`, `csvAnalysisResult`, `featureAverages`) inside `SpamCheckPage.jsx`.
* **Task 2.2:** Build the **Main Input Card** containing the MUI `<Tabs>` component.
* **Task 2.3:** Implement the UI for the 3 input modes: Raw Text TextField (Tab 1), Single File Dropzone (Tab 2), and CSV Batch Dropzone with the Top N Keyword selector (Tab 3).
* **Task 2.4:** Write the `fetch` functions (`analyzeSingleEmail`, `analyzeCsvBatch`, `fetchFeatureAverages`) and wire them up to the "Analyze Content" button. Handle loading spinners, request mapping, and error snackbars.

---

## 🧑‍💻 Developer 3: Data Visualization & Result Dashboards
**Focus:** Rendering complex dynamic UI elements, D3.js charts, and analytical dashboards based on the API responses.

> **Note on Parallel Development:** Developer 3 should not wait for Developer 2 to finish the API hooks. Instead, use the exact JSON response examples provided in `docs/api_specification.md` as hardcoded mock data. Pass this mock data into the components via props, and later swap it out for Developer 2's real state variables.

* **Task 3.1:** Build **Dashboard A (Single Email)** components:
  * The Model Selection comparative grid and active model toggle.
  * The Active Model Overall Result Card with the `<CircularProgress>` confidence gauge and Spam/Ham badge.
* **Task 3.2:** Build the interactive **Sentence-Level Heatmap** for Dashboard A, complete with the threshold slider, highlighted `<span>` elements, and the sliding Drawer for detailed sentence probability breakdowns.
* **Task 3.3:** Implement the D3.js **Feature Radar Chart** (`FeatureRadarChart.jsx`) mapping the 9 numeric axes, overlapping polygons (This Email vs. Spam Avg vs. Ham Avg), and data tooltips.
* **Task 3.4:** Build **Dashboard B (CSV Batch)** components:
  * The Processed Count Banner.
  * The Multi-Model Distribution Grid rendering spam vs. ham linear progress bars.
  * The Top Spam Keywords Visualizer rendering percentage progress bars based on the Naive Bayes spam classifications.
