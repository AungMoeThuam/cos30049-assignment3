import html2canvas from "html2canvas";

export const API_BASE_URL = "http://localhost:8000/api/v1";

export const SAMPLE_EMAIL = `Return-Path: <offers@unbelievable-prizes.com>
Subject: URGENT: Your Account Has Been Selected for a $50,000 Payout!
Date: Thu, 24 Aug 2024 14:22:10 +0000

Dear Valued Customer,

Congratulations! You have been exclusively selected to receive a one-time cash payout of $50,000 USD. This is not a drill!`;

export const MODELS = [
  { key: "naive_bayes", label: "Naive Bayes" },
  { key: "k_means", label: "K-Means Clustering" },
  { key: "logistic_regression", label: "Logistic Regression" },
  { key: "linear_svm", label: "Linear SVM" },
];

export const FEATURE_AXES = [
  { key: "num_urls", label: "URLs" },
  { key: "num_exclamation", label: "!" },
  { key: "num_question", label: "?" },
  { key: "num_dollar", label: "$" },
  { key: "num_all_caps", label: "Caps" },
  { key: "num_numbers", label: "Numbers" },
  { key: "word_count", label: "Words" },
  { key: "capital_ratio", label: "Cap ratio" },
  { key: "emoji_count", label: "Emoji" },
];

export const cardSx = {
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1.5,
  boxShadow: "none",
  "@media print": {
    pageBreakInside: "avoid",
    breakInside: "avoid",
  },
};

export function percent(value) {
  return Math.round(Number(value || 0) * 100);
}

export function readData(payload) {
  return payload?.data ?? payload;
}

export function getModelPrediction(result, modelKey) {
  return result?.models?.[modelKey] ?? null;
}

export function getConfidence(prediction) {
  return percent(prediction?.confidence);
}

export function verdictColor(label) {
  if (label === "spam") return "error";
  if (label === "ham") return "success";
  return "text.secondary";
}

export const handleExportComponent = async (elementId, filename) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const exportBtns = element.querySelectorAll(".export-btn-hide");
  exportBtns.forEach((btn) => (btn.style.display = "none"));

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2,
    });
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (err) {
    console.error("Export failed:", err);
  } finally {
    exportBtns.forEach((btn) => (btn.style.display = ""));
  }
};
