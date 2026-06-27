import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { CsvBatchDashboard } from "../components/spamcheck/CsvBatchDashboard";
import { OverallAssessment } from "../components/spamcheck/ConfidenceGauge";
import { EmptyState, UploadZone } from "../components/spamcheck/EmptyState";
import { FeatureRadarChart } from "../components/spamcheck/FeatureRadarChart";
import { ModelComparison } from "../components/spamcheck/ModelComparison";
import { SentenceHeatmap } from "../components/spamcheck/SentenceHeatmap";
import { SentenceTokenCard } from "../components/spamcheck/SentenceTokenCard";
import {
  API_BASE_URL,
  SAMPLE_EMAIL,
  cardSx,
  getModelPrediction,
  readData,
} from "../components/spamcheck/constants";

export default function SpamCheckPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [pastedEmailText, setPastedEmailText] = useState(SAMPLE_EMAIL);
  const [selectedSingleFile, setSelectedSingleFile] = useState(null);
  const [selectedCsvFile, setSelectedCsvFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [singleAnalysisResult, setSingleAnalysisResult] = useState(null);
  const [csvAnalysisResult, setCsvAnalysisResult] = useState(null);
  const [selectedModel, setSelectedModel] = useState("naive_bayes");
  const [highlightThreshold, setHighlightThreshold] = useState(50);
  const [selectedSentence, setSelectedSentence] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [featureAverages, setFeatureAverages] = useState(null);

  // Fetch feature averages on mount
  useEffect(() => {
    let isMounted = true;
    fetch(`${API_BASE_URL}/feature-averages`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (isMounted && payload) setFeatureAverages(readData(payload));
      })
      .catch(() => {
        if (isMounted) setFeatureAverages(null);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Reset results when tab changes
  useEffect(() => {
    setSingleAnalysisResult(null);
    setCsvAnalysisResult(null);
    setSelectedSentence(null);
    setErrorMessage("");
  }, [activeTab]);

  const activePrediction = getModelPrediction(singleAnalysisResult, selectedModel);
  const emailFeatures = singleAnalysisResult?.features ?? null;

  async function handleAnalyze() {
    try {
      setIsLoading(true);
      setErrorMessage("");
      setSelectedSentence(null);

      if (activeTab === 2) {
        if (!selectedCsvFile) throw new Error("Select a CSV file before running batch analysis.");
        const formData = new FormData();
        formData.append("file", selectedCsvFile);
        const response = await fetch(`${API_BASE_URL}/predict/csv`, { method: "POST", body: formData });
        const payload = await response.json();
        if (!response.ok || payload.success === false) throw new Error(payload.error || "CSV batch prediction failed.");
        setCsvAnalysisResult(readData(payload));
        setSingleAnalysisResult(null);
        return;
      }

      const formData = new FormData();
      if (activeTab === 0) {
        if (!pastedEmailText.trim()) throw new Error("Paste email content before analysis.");
        formData.append("body", pastedEmailText);
      } else {
        if (!selectedSingleFile) throw new Error("Select an email file before analysis.");
        formData.append("file", selectedSingleFile);
      }

      const response = await fetch(`${API_BASE_URL}/predict`, { method: "POST", body: formData });
      const payload = await response.json();
      if (!response.ok || payload.success === false) throw new Error(payload.error || "Email prediction failed.");
      setSingleAnalysisResult(readData(payload));
      setCsvAnalysisResult(null);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Box sx={{ pb: 3 }}>
      {/* ── Page Header ── */}
      <Box sx={{ mb: 2.5, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
            Email Spam Detector
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 700, lineHeight: 1.6 }}>
            Powered by machine learning models trained via Scikit-Learn (Naive Bayes, K-Means
            Clustering, Logistic Regression, and Linear SVM).
          </Typography>
          <Box sx={{ mt: 1.5 }}>
            <Chip
              label="View Training Dataset"
              component="a"
              href="https://liveswinburneeduau-my.sharepoint.com/:f:/g/personal/105292899_student_swin_edu_au/IgArWPNGyw_GTa-5LNHZSanxAT9Ok7633LuMn-NqIE9SUz0?e=axdxlL"
              target="_blank"
              rel="noopener noreferrer"
              color="primary"
              variant="outlined"
              size="small"
              clickable
              sx={{ fontWeight: "bold" }}
            />
          </Box>
        </Box>
        {(((activeTab === 0 || activeTab === 1) && singleAnalysisResult) ||
          (activeTab === 2 && csvAnalysisResult)) && (
          <Button
            variant="outlined"
            onClick={() => window.print()}
            sx={{
              "@media print": { display: "none" },
              borderRadius: 1,
              textTransform: "none",
              fontWeight: 800,
            }}
          >
            Export PDF Report
          </Button>
        )}
      </Box>

      {/* ── Input Panel + Verdict ── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: activeTab === 2 ? "1fr" : "minmax(0, 8fr) minmax(280px, 4fr)",
          },
          gap: 2,
          mb: 2,
          "@media print": { display: "block", mb: 0 },
        }}
      >
        <Card sx={{ ...cardSx, "@media print": { display: "none" } }}>
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
              <Tab label="Raw Text Paste" />
              <Tab label="File Upload" />
              <Tab label="Batch CSV" />
            </Tabs>
            <Divider sx={{ mb: 2 }} />

            {activeTab === 0 && (
              <TextField
                label="Email Content"
                multiline
                rows={6}
                fullWidth
                required
                value={pastedEmailText}
                onChange={(event) => setPastedEmailText(event.target.value)}
                placeholder="Paste email content here..."
              />
            )}
            {activeTab === 1 && (
              <UploadZone
                accept=".eml,.msg,.txt"
                file={selectedSingleFile}
                label="Upload a single email file"
                helperText="Accepted formats: .eml, .msg, .txt"
                onChange={setSelectedSingleFile}
                onClear={() => setSelectedSingleFile(null)}
              />
            )}
            {activeTab === 2 && (
              <UploadZone
                accept=".csv"
                file={selectedCsvFile}
                label="Upload a CSV batch"
                helperText="CSV must include a body column. A subject column is optional."
                onChange={setSelectedCsvFile}
                onClear={() => setSelectedCsvFile(null)}
              />
            )}

            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
              <Button
                variant="contained"
                size="small"
                onClick={handleAnalyze}
                disabled={isLoading}
                sx={{
                  bgcolor: "#0F172A",
                  "&:hover": { bgcolor: "#1e293b" },
                  minWidth: 138,
                  borderRadius: 1,
                }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : "Analyze Content"}
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {activeTab !== 2 && <OverallAssessment prediction={activePrediction} />}
      </Box>

      {/* ── Results Area ── */}
      {activeTab === 2 || csvAnalysisResult ? (
        <CsvBatchDashboard result={csvAnalysisResult} activeModel={selectedModel} />
      ) : (
        <Stack spacing={2}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 8fr) minmax(280px, 4fr)" },
              gap: 2,
            }}
          >
            <ModelComparison
              result={singleAnalysisResult}
              selectedModel={selectedModel}
              onSelectedModelChange={setSelectedModel}
            />
            <FeatureRadarChart features={emailFeatures} averages={featureAverages} />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 8fr) minmax(280px, 4fr)" },
              gap: 2,
            }}
          >
            <SentenceHeatmap
              sentences={singleAnalysisResult?.sentences}
              selectedModel={selectedModel}
              threshold={highlightThreshold}
              onThresholdChange={setHighlightThreshold}
              selectedSentence={selectedSentence}
              onSentenceSelect={setSelectedSentence}
            />
            <SentenceTokenCard sentence={selectedSentence} selectedModel={selectedModel} />
          </Box>

          {singleAnalysisResult?.sentences?.length ? (
            <Alert severity="info" sx={{ "& .MuiAlert-message": { width: "100%" } }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 0.5 }}>
                Understanding Special Tokens
              </Typography>
              <Typography variant="body2" color="text.secondary">
                During the content analysis, our AI automatically anonymizes and groups certain
                patterns. If you see words like <strong>phonenumber</strong>, <strong>url</strong>,{" "}
                <strong>email</strong>, <strong>percentage</strong>, or <strong>number</strong> in
                the cloud above, these represent categories of data found in the text rather than
                literal words.
              </Typography>
            </Alert>
          ) : null}
        </Stack>
      )}

      {/* ── Error Snackbar ── */}
      <Snackbar
        open={Boolean(errorMessage)}
        autoHideDuration={5000}
        onClose={() => setErrorMessage("")}
      >
        <Alert severity="error" onClose={() => setErrorMessage("")}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
