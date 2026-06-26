import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import html2canvas from "html2canvas";
import DownloadIcon from "@mui/icons-material/Download";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  Link,
  MenuItem,
  Paper,
  Select,
  Slider,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

const API_BASE_URL = "http://localhost:8000/api/v1";

const SAMPLE_EMAIL = `Return-Path: <offers@unbelievable-prizes.com>
Subject: URGENT: Your Account Has Been Selected for a $50,000 Payout!
Date: Thu, 24 Aug 2024 14:22:10 +0000

Dear Valued Customer,

Congratulations! You have been exclusively selected to receive a one-time cash payout of $50,000 USD. This is not a drill!`;

const MODELS = [
  { key: "naive_bayes", label: "Naive Bayes" },
  { key: "k_means", label: "K-Means Clustering" },
  { key: "logistic_regression", label: "Logistic Regression" },
  { key: "linear_svm", label: "Linear SVM" },
];

const FEATURE_AXES = [
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

const cardSx = {
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1.5,
  boxShadow: "none",
  "@media print": {
    pageBreakInside: "avoid",
    breakInside: "avoid",
  },
};

function percent(value) {
  return Math.round(Number(value || 0) * 100);
}

function readData(payload) {
  return payload?.data ?? payload;
}

function getModelPrediction(result, modelKey) {
  return result?.models?.[modelKey] ?? null;
}

function getConfidence(prediction) {
  return percent(prediction?.confidence);
}

function verdictColor(label) {
  if (label === "spam") {
    return "error";
  }
  if (label === "ham") {
    return "success";
  }
  return "text.secondary";
}

function EmptyState({ title, description }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 4,
        minHeight: 132,
        borderStyle: "dashed",
        borderRadius: 2,
        display: "grid",
        placeItems: "center",
        textAlign: "center",
        bgcolor: "#f7f9fb",
      }}
    >
      <Box>
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 520 }}>
          {description}
        </Typography>
      </Box>
    </Paper>
  );
}

function UploadZone({ accept, file, label, helperText, onChange, onClear }) {
  return (
    <Box
      component="label"
      sx={{
        display: "block",
        mt: 2,
        p: 4,
        border: "1.5px dashed",
        borderColor: "divider",
        borderRadius: 2,
        cursor: "pointer",
        textAlign: "center",
        bgcolor: "#f7f9fb",
        transition: "border-color 160ms, background-color 160ms",
        "&:hover": { borderColor: "text.primary", bgcolor: "#fff" },
      }}
    >
      <input
        hidden
        type="file"
        accept={accept}
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
      <Typography variant="h6" fontWeight={700}>
        {label}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        {helperText}
      </Typography>
      {file ? (
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          sx={{ mt: 2 }}
        >
          <Chip label={file.name} onDelete={onClear} variant="outlined" />
        </Stack>
      ) : null}
    </Box>
  );
}

function ConfidenceGauge({ value, label }) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <CircularProgress
        variant="determinate"
        value={100}
        size={108}
        thickness={3}
        sx={{ color: "grey.200", position: "absolute" }}
      />
      <CircularProgress
        variant="determinate"
        value={safeValue}
        size={108}
        thickness={3}
        color={label === "spam" ? "error" : "success"}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h5" fontWeight={800}>
          {safeValue}%
        </Typography>
      </Box>
    </Box>
  );
}

function EmptyRadarPlot() {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={3}
      alignItems="center"
      sx={{ mt: 2 }}
    >
      <Box
        sx={{
          width: 176,
          height: 176,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          bgcolor: "#f7f9fb",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: "50% 0 auto",
            borderTop: "1px solid #d8dadc",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, transparent 49.5%, #d8dadc 50%, transparent 50.5%), linear-gradient(45deg, transparent 49.5%, #d8dadc 50%, transparent 50.5%), linear-gradient(135deg, transparent 49.5%, #d8dadc 50%, transparent 50.5%)",
          },
        }}
      >
        <Box
          component="svg"
          viewBox="0 0 100 100"
          sx={{ width: 126, height: 126, zIndex: 1 }}
        >
          <polygon
            points="50,14 76,32 70,70 50,88 25,70 22,34"
            fill="rgba(186,26,26,0.08)"
            stroke="#ba1a1a"
            strokeWidth="1.5"
          />
          <polygon
            points="50,28 63,42 61,62 50,76 37,62 35,43"
            fill="rgba(0,0,0,0.08)"
            stroke="#000"
            strokeWidth="1.5"
          />
        </Box>
        <Typography
          variant="caption"
          sx={{ position: "absolute", zIndex: 2, bgcolor: "#f7f9fb", px: 0.5 }}
        >
          Radar Plot
        </Typography>
      </Box>
      <Stack spacing={0.75}>
        {[
          ["#000", "This Email"],
          ["#ba1a1a", "Spam Average"],
          ["#2e7d32", "Ham Average"],
        ].map(([color, label]) => (
          <Stack key={label} direction="row" spacing={1} alignItems="center">
            <Box
              sx={{ width: 10, height: 10, bgcolor: color, borderRadius: 0.5 }}
            />
            <Typography variant="caption">{label}</Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}

function ModelComparison({ result, selectedModel, onSelectedModelChange }) {
  const predictions = MODELS.map((model) => ({
    ...model,
    prediction: getModelPrediction(result, model.key),
  }));

  return (
    <Card sx={{ ...cardSx, height: "100%", display: "flex", flexDirection: "column" }} id="export-model-comparison">
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 }, display: "flex", flexDirection: "column", flexGrow: 1 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            gap: 2,
            mb: 2,
            width: "100%",
          }}
        >
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Model Comparison & Distribution
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Compare spam and safe probabilities across all classifiers.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel id="classifier-label">Active Classifier</InputLabel>
              <Select
                labelId="classifier-label"
                value={selectedModel}
                label="Active Classifier"
                onChange={(event) => onSelectedModelChange(event.target.value)}
              >
                {MODELS.map((model) => (
                  <MenuItem key={model.key} value={model.key}>
                    {model.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton
              className="export-btn-hide"
              onClick={() => handleExportComponent("export-model-comparison", "model-comparison.png")}
              size="small"
              title="Download Image"
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "minmax(220px, 0.9fr) minmax(0, 2fr)",
            },
            gap: 3,
            flexGrow: 1,
            mb: 1,
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 1.5,
              height: "100%",
            }}
          >
            {predictions.map(({ key, label, prediction }) => (
              <Paper
                key={key}
                variant="outlined"
                sx={{
                  p: 1.25,
                  height: "100%",
                  borderRadius: 1.5,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  borderColor:
                    selectedModel === key ? "text.primary" : "divider",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  textTransform="uppercase"
                >
                  {label}
                </Typography>
                <Box sx={{ mt: 1.5 }}>
                  <Typography
                    fontWeight={900}
                    color={
                      prediction?.label
                        ? `${verdictColor(prediction.label)}.main`
                        : "text.secondary"
                    }
                    sx={{ mb: 0.5 }}
                  >
                    {getConfidence(prediction)}%{" "}
                    <Box
                      component="span"
                      sx={{ fontSize: 11, textTransform: "uppercase" }}
                    >
                      {prediction?.label ?? "Pending"}
                    </Box>
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.max(
                      percent(prediction?.spam_probability),
                      percent(prediction?.ham_probability),
                    )}
                    color={prediction?.label === "ham" ? "success" : "error"}
                    sx={{ height: 6, borderRadius: 1 }}
                  />
                </Box>
              </Paper>
            ))}
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              height: "100%",
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "36px 1fr",
                gap: 1,
                height: "100%",
                alignItems: "end",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  height: "calc(100% - 24px)",
                  pr: 0.5,
                }}
              >
                {[100, 50, 0].map((tick) => (
                  <Typography
                    key={tick}
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      lineHeight: 1,
                      height: 12,
                      display: "flex",
                      alignItems: "center",
                      fontSize: "11px",
                    }}
                  >
                    {tick}%
                  </Typography>
                ))}
              </Box>
              <Box
                sx={{
                  height: "calc(100% - 24px)",
                  minHeight: 180,
                  position: "relative",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-around",
                  gap: 2,
                  px: 2,
                  background:
                    "linear-gradient(to bottom, rgba(198,198,205,.35) 1px, transparent 1px) 0 0 / 100% 50%",
                }}
              >
                {predictions.map(({ key, label, prediction }) => {
                  const spam = percent(prediction?.spam_probability);
                  const ham = percent(prediction?.ham_probability);
                  const isActive = selectedModel === key;
                  return (
                    <Box
                      key={key}
                      onClick={() => onSelectedModelChange(key)}
                      sx={{
                        height: "100%",
                        flex: 1,
                        minWidth: 44,
                        display: "flex",
                        alignItems: "flex-end",
                        gap: 0.5,
                        position: "relative",
                        cursor: "pointer",
                        borderRadius: "4px 4px 0 0",
                        transition: "background-color 0.2s ease",
                        "&:hover": {
                          bgcolor: "action.hover",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          flex: 1,
                          height: `${spam}%`,
                          bgcolor: isActive ? "error.main" : "#fca5a5",
                          borderRadius: "4px 4px 0 0",
                          transition: "background-color 0.3s ease",
                        }}
                      />
                      <Box
                        sx={{
                          flex: 1,
                          height: `${ham}%`,
                          bgcolor: isActive ? "#22c55e" : "#86efac",
                          borderRadius: "4px 4px 0 0",
                          transition: "background-color 0.3s ease",
                        }}
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          position: "absolute",
                          left: "50%",
                          bottom: -24,
                          transform: "translateX(-50%)",
                          whiteSpace: "nowrap",
                          fontSize: "11px",
                          fontWeight: 500,
                        }}
                      >
                        {label
                          .replace(" Clustering", "")
                          .replace(" Regression", " Reg")}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function OverallAssessment({ prediction }) {
  if (!prediction) {
    return (
      <Card sx={cardSx}>
        <CardContent
          sx={{ p: 2, textAlign: "center", "&:last-child": { pb: 2 } }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            textAlign="left"
            textTransform="uppercase"
          >
            Consensus Verdict
          </Typography>
          <Box sx={{ my: 2 }}>
            <ConfidenceGauge value={0} label="ham" />
          </Box>
          <Stack spacing={1} sx={{ mt: 1, alignItems: "center" }}>
            <Chip
              variant="outlined"
              label="WAITING FOR ANALYSIS"
              sx={{ fontWeight: 800, fontSize: 11, alignSelf: "center" }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Confidence appears after content analysis.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  const isSpam = prediction.label === "spam";

  return (
    <Card sx={cardSx}>
      <CardContent
        sx={{ p: 2, textAlign: "center", "&:last-child": { pb: 2 } }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          textAlign="left"
          textTransform="uppercase"
        >
          Consensus Verdict
        </Typography>
        <Box sx={{ my: 2 }}>
          <ConfidenceGauge
            value={getConfidence(prediction)}
            label={prediction.label}
          />
        </Box>
        <Stack spacing={1} sx={{ mt: 1, alignItems: "center" }}>
          <Chip
            color={isSpam ? "error" : "success"}
            label={isSpam ? "CLASSIFIED AS SPAM" : "CLASSIFIED AS SAFE (HAM)"}
            sx={{ fontWeight: 800, px: 1, fontSize: 11, alignSelf: "center" }}
          />
          <Typography variant="caption" color="text.secondary" display="block">
            Confidence from the selected active classifier.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

function FeatureRadarChart({ features, averages }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const hasEmailFeatures = Boolean(features && Object.keys(features).length);
  const [hiddenSeries, setHiddenSeries] = useState(new Set());

  const toggleSeries = (key) => {
    setHiddenSeries(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const series = useMemo(
    () => [
      { key: "email", label: "This Email", color: "#000000", values: features },
      {
        key: "spam",
        label: "Spam Average",
        color: "#ba1a1a",
        values: averages?.spam,
      },
      {
        key: "ham",
        label: "Ham Average",
        color: "#2e7d32",
        values: averages?.ham,
      },
    ],
    [averages, features],
  );

  const getNormalized = useCallback(
    (key, value) => {
      const DEFAULT_SCALER = {
        num_urls: { mean: 3.0, std: 2.0 },
        num_exclamation: { mean: 3.0, std: 4.0 },
        num_question: { mean: 2.8, std: 3.0 },
        num_dollar: { mean: 3.3, std: 4.5 },
        num_all_caps: { mean: 40.0, std: 30.0 },
        num_numbers: { mean: 400.0, std: 400.0 },
        word_count: { mean: 400.0, std: 250.0 },
        capital_ratio: { mean: 0.17, std: 0.06 },
        emoji_count: { mean: 0.2, std: 0.4 },
      };
      const scaler = averages?.scaler?.[key] ??
        DEFAULT_SCALER[key] ?? { mean: 0.0, std: 1.0 };
      const z = (Number(value || 0) - scaler.mean) / (scaler.std || 1.0);
      return Math.max(0, Math.min(1, (z + 2.5) / 5.0));
    },
    [averages],
  );

  useEffect(() => {
    if (!hasEmailFeatures || !svgRef.current || !containerRef.current) {
      return;
    }

    const width = 260;
    const height = 260;
    const center = width / 2;
    const radius = 92;
    const angleFor = (index) =>
      (Math.PI * 2 * index) / FEATURE_AXES.length - Math.PI / 2;
    const pointFor = (axisIndex, value) => {
      const angle = angleFor(axisIndex);
      const scaledRadius = radius * Math.max(0, Math.min(1, value));
      return [
        center + Math.cos(angle) * scaledRadius,
        center + Math.sin(angle) * scaledRadius,
      ];
    };
    const pointsFor = (values) =>
      FEATURE_AXES.map((axis, index) => {
        const normalized = getNormalized(axis.key, values?.[axis.key]);
        return pointFor(index, normalized);
      });

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    let tooltip = d3.select(containerRef.current).select(".radar-tooltip");
    if (tooltip.empty()) {
      tooltip = d3.select(containerRef.current)
        .append("div")
        .attr("class", "radar-tooltip")
        .style("position", "absolute")
        .style("background", "rgba(15, 23, 42, 0.95)")
        .style("color", "#fff")
        .style("padding", "8px 12px")
        .style("border-radius", "6px")
        .style("font-size", "12px")
        .style("font-family", '"Manrope", sans-serif')
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("z-index", 10)
        .style("box-shadow", "0 4px 6px -1px rgb(0 0 0 / 0.1)");
    }

    const line = d3.line().curve(d3.curveLinearClosed);

    svg
      .selectAll(".radar-grid")
      .data([0.25, 0.5, 0.75, 1])
      .join("path")
      .attr("class", "radar-grid")
      .attr("d", (level) =>
        line(FEATURE_AXES.map((_, index) => pointFor(index, level))),
      )
      .attr("fill", "none")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-width", 1);

    const axes = svg
      .selectAll(".radar-axis")
      .data(FEATURE_AXES)
      .join("g")
      .attr("class", "radar-axis");

    axes
      .append("line")
      .attr("class", "radar-axis-line")
      .attr("x1", center)
      .attr("y1", center)
      .attr("x2", (_, index) => pointFor(index, 1)[0])
      .attr("y2", (_, index) => pointFor(index, 1)[1])
      .attr("stroke", "#e2e8f0");

    axes
      .append("text")
      .attr("class", "radar-axis-label")
      .attr("x", (_, index) => pointFor(index, 1.17)[0])
      .attr("y", (_, index) => pointFor(index, 1.17)[1])
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-size", 10)
      .attr("font-weight", 600)
      .attr("fill", "#64748b")
      .style("cursor", "pointer")
      .text((axis) => axis.label)
      .on("mouseover", function(event, axisData) {
        d3.selectAll(".radar-axis-line")
          .attr("stroke", d => d.key === axisData.key ? "#94a3b8" : "#f1f5f9")
          .attr("stroke-width", d => d.key === axisData.key ? 2 : 1);
        d3.selectAll(".radar-axis-label")
          .attr("fill", d => d.key === axisData.key ? "#0f172a" : "#cbd5e1");
      })
      .on("mouseout", function() {
        d3.selectAll(".radar-axis-line")
          .attr("stroke", "#e2e8f0")
          .attr("stroke-width", 1);
        d3.selectAll(".radar-axis-label")
          .attr("fill", "#64748b");
      });

    const visibleSeries = series.filter((item) => item.values && !hiddenSeries.has(item.key));
    
    svg
      .selectAll(".radar-series")
      .data(visibleSeries, d => d.key)
      .join(
        enter => enter.append("path")
          .attr("class", "radar-series")
          .attr("d", (item) => line(pointsFor(item.values)))
          .attr("fill", (item) => item.color)
          .attr("fill-opacity", 0)
          .attr("stroke", (item) => item.color)
          .attr("stroke-width", 2)
          .style("pointer-events", "none")
          .call(enter => enter.transition().duration(700).attr("fill-opacity", 0.08)),
        update => update
          .call(update => update.transition().duration(700)
            .attr("d", (item) => line(pointsFor(item.values)))
          ),
        exit => exit.transition().duration(300).attr("fill-opacity", 0).remove()
      );

    visibleSeries.forEach((item) => {
      svg
        .selectAll(`.radar-point-${item.key}`)
        .data(FEATURE_AXES)
        .join(
          enter => enter.append("circle")
            .attr("class", `radar-point-${item.key}`)
            .attr("cx", (axis, index) => pointFor(index, getNormalized(axis.key, item.values?.[axis.key]))[0])
            .attr("cy", (axis, index) => pointFor(index, getNormalized(axis.key, item.values?.[axis.key]))[1])
            .attr("r", 0)
            .attr("fill", item.color)
            .style("cursor", "crosshair")
            .call(enter => enter.transition().duration(700).attr("r", 4)),
          update => update
            .call(update => update.transition().duration(700)
              .attr("cx", (axis, index) => pointFor(index, getNormalized(axis.key, item.values?.[axis.key]))[0])
              .attr("cy", (axis, index) => pointFor(index, getNormalized(axis.key, item.values?.[axis.key]))[1])
            ),
          exit => exit.remove()
        )
        .on("mouseover", function(event, axis) {
          d3.select(this).transition().duration(150).attr("r", 7).attr("stroke", "#fff").attr("stroke-width", 2);
          const rawVal = item.values?.[axis.key] ?? 0;
          let displayVal = rawVal;
          if (axis.key === "capital_ratio" || axis.key === "emoji_count") {
             displayVal = Number(rawVal).toFixed(3);
          } else if (Number.isFinite(rawVal) && !Number.isInteger(rawVal)) {
             displayVal = Number(rawVal).toFixed(2);
          }
          tooltip.html(`
            <div style="font-weight: 800; margin-bottom: 4px; color: ${item.color}">${item.label}</div>
            <div>${axis.label}: <strong style="font-size: 13px;">${displayVal}</strong></div>
          `)
            .style("opacity", 1);
        })
        .on("mousemove", function(event) {
           const [x, y] = d3.pointer(event, containerRef.current);
           tooltip
             .style("left", `${x + 15}px`)
             .style("top", `${y + 15}px`);
        })
        .on("mouseout", function() {
           d3.select(this).transition().duration(150).attr("r", 4).attr("stroke", "none");
           tooltip.style("opacity", 0);
        });
    });
  }, [hasEmailFeatures, getNormalized, series, hiddenSeries]);

  return (
    <Card sx={{ ...cardSx, height: "100%", display: "flex", flexDirection: "column" }} id="export-radar-chart">
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 }, display: "flex", flexDirection: "column", flexGrow: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Feature Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Compares extracted content signals against training averages.
            </Typography>
          </Box>
          <IconButton 
            className="export-btn-hide"
            onClick={() => handleExportComponent("export-radar-chart", "feature-radar-chart.png")} 
            size="small" 
            title="Download Image"
          >
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Stack>

        {!hasEmailFeatures ? (
          <EmptyRadarPlot />
        ) : (
          <Stack
            direction="column"
            spacing={3}
            alignItems="center"
            sx={{ mt: 3, width: "100%" }}
          >
            <Box 
              ref={containerRef}
              sx={{ width: "100%", display: "flex", justifyContent: "center", position: "relative" }}
            >
              <Box
                component="svg"
                ref={svgRef}
                role="img"
                aria-label="Feature radar chart"
                sx={{ width: 260, height: 260, maxWidth: "100%", display: "block", overflow: "visible" }}
              />
            </Box>
            <Stack 
              direction="row" 
              spacing={3} 
              justifyContent="center" 
              flexWrap="wrap"
            >
              {series.map((item) => {
                const isHidden = hiddenSeries.has(item.key);
                return (
                  <Stack
                    key={item.key}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    onClick={() => toggleSeries(item.key)}
                    sx={{ 
                      cursor: "pointer", 
                      opacity: isHidden ? 0.4 : 1,
                      transition: "opacity 0.2s",
                      "&:hover": { opacity: isHidden ? 0.6 : 0.8 }
                    }}
                  >
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: 0.5,
                        bgcolor: item.color,
                      }}
                    />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600,
                        textDecoration: isHidden ? "line-through" : "none"
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

function SentenceHeatmap({
  sentences,
  selectedModel,
  threshold,
  onThresholdChange,
  selectedSentence,
  onSentenceSelect,
}) {
  if (!sentences?.length) {
    return (
      <Card sx={cardSx}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Sentence Spam Highlighter
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              mt: 2,
              p: 2,
              bgcolor: "#f7f9fb",
              borderRadius: 1,
              minHeight: 92,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Analyze content to filter sentences by their spam probability.
            </Typography>
          </Paper>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ ...cardSx, height: "100%", display: "flex", flexDirection: "column" }} id="export-sentence-heatmap">
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 }, display: "flex", flexDirection: "column", flexGrow: 1 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Stack direction="row" alignItems="flex-start" spacing={1}>
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Sentence Spam Highlighter
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ maxWidth: 480 }}
              >
                Adjust the threshold to filter sentences. Click any highlighted
                sentence to inspect its top spam-triggering words.
              </Typography>
            </Box>
            <IconButton
              className="export-btn-hide"
              onClick={() => handleExportComponent("export-sentence-heatmap", "sentence-heatmap.png")}
              size="small"
              title="Download Image"
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Stack>
          <Box sx={{ minWidth: { xs: "100%", md: 260 } }}>
            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              <Typography variant="caption" color="text.secondary">
                Highlight Threshold:
              </Typography>
              <Typography variant="caption" fontWeight={800}>
                {threshold}%
              </Typography>
            </Stack>
            <Slider
              value={threshold}
              min={0}
              max={100}
              onChange={(_, value) => onThresholdChange(value)}
            />
          </Box>
        </Stack>

        <Paper
          variant="outlined"
          sx={{
            mt: 3,
            p: 3,
            bgcolor: "#f7f9fb",
            borderRadius: 2,
            lineHeight: 2.1,
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(0,0,0,0.1)",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "rgba(0,0,0,0.15)",
            },
          }}
        >
          {sentences.map((sentence, index) => {
            const prediction = sentence.models?.[selectedModel];
            const spamProbability = percent(prediction?.spam_probability);
            const isHighlighted = spamProbability >= threshold;
            const opacity = Math.max(0.12, spamProbability / 100);

            return (
              <Box
                component="button"
                key={`${sentence.text}-${index}`}
                title={`${spamProbability}% spam probability`}
                onClick={() => onSentenceSelect(sentence)}
                sx={{
                  display: "inline",
                  border: 0,
                  borderRadius: "4px",
                  mx: 0.1,
                  px: 0.3,
                  py: 0.1,
                  cursor: "pointer",
                  font: "inherit",
                  color: selectedSentence?.text === sentence.text
                    ? "#ba1a1a"
                    : (isHighlighted ? "#5f1515" : "text.primary"),
                  fontWeight: selectedSentence?.text === sentence.text || isHighlighted
                    ? 500
                    : "inherit",
                  bgcolor: selectedSentence?.text === sentence.text
                    ? "rgba(186, 26, 26, 0.16)"
                    : (isHighlighted
                      ? `rgba(186, 26, 26, ${Math.max(0.08, opacity * 0.14)})`
                      : "transparent"),
                  borderBottom: selectedSentence?.text === sentence.text
                    ? "2px solid #ba1a1a"
                    : (isHighlighted ? "2px solid rgba(186, 26, 26, 0.25)" : "none"),
                  transition: "background-color 0.15s ease, border-color 0.15s ease",
                  "&:hover": {
                    bgcolor: isHighlighted
                      ? "rgba(186, 26, 26, 0.22)"
                      : "rgba(0, 0, 0, 0.05)",
                  },
                }}
              >
                {sentence.text}
              </Box>
            );
          })}
        </Paper>
      </CardContent>
    </Card>
  );
}

function SentenceTokenCard({ sentence, selectedModel }) {
  const [tokenData, setTokenData] = useState(null);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);

  useEffect(() => {
    if (!sentence) {
      setTokenData(null);
      return;
    }

    let cancelled = false;
    setIsLoadingTokens(true);
    setTokenData(null);

    fetch(`${API_BASE_URL}/predict/sentence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sentence: sentence.text }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (!cancelled && payload?.success) {
          setTokenData(readData(payload));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoadingTokens(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sentence]);

  return (
    <Card sx={{ ...cardSx, height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 }, display: "flex", flexDirection: "column", flexGrow: 1 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          textTransform="uppercase"
          sx={{ mb: 1.5 }}
        >
          Top Keywords
        </Typography>

        {!sentence ? (
          <Typography variant="body2" color="text.secondary">
            Click a sentence in the heatmap to inspect its top spam-triggering
            tokens.
          </Typography>
        ) : isLoadingTokens ? (
          <Stack alignItems="center" sx={{ py: 2 }}>
            <CircularProgress size={24} />
          </Stack>
        ) : tokenData?.tokens?.length ? (
          <Box
            sx={{
              overflowY: "auto",
              maxHeight: 280,
              pr: 0.5,
              "&::-webkit-scrollbar": {
                width: "6px",
              },
              "&::-webkit-scrollbar-track": {
                background: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "rgba(0,0,0,0.1)",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                background: "rgba(0,0,0,0.15)",
              },
            }}
          >
            <Stack spacing={1}>
              {tokenData.tokens
                .map((t) => ({
                  word: t.token,
                  score: percent(t.models?.[selectedModel]?.spam_probability),
                }))
                .sort((a, b) => b.score - a.score)
                .slice(0, 15)
                .map((kw) => (
                  <Paper
                    key={kw.word}
                    variant="outlined"
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      bgcolor: "#f7f9fb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                    }}
                  >
                    <Typography variant="body2">{kw.word}</Typography>
                    <Chip
                      size="small"
                      label={`${kw.score}%`}
                      color={kw.score >= 50 ? "error" : "default"}
                      variant="outlined"
                      sx={{
                        height: 24,
                        fontWeight: 800,
                        bgcolor: kw.score >= 50 ? "#ffdad6" : undefined,
                      }}
                    />
                  </Paper>
                ))}
            </Stack>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No keyword tokens found for this sentence.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

function SimpleWordCloud({ words }) {
  if (!words || words.length === 0) {
    return (
      <Typography color="text.secondary">
        No spam keywords were returned for this batch.
      </Typography>
    );
  }

  const maxCount = Math.max(...words.map((w) => w.count), 1);
  const minCount = Math.min(...words.map((w) => w.count), 0);

  const getFontSize = (count) => {
    if (maxCount === minCount) return 24;
    const ratio = (count - minCount) / (maxCount - minCount);
    return 14 + ratio * 46;
  };

  const getColor = (count) => {
    if (maxCount === minCount) return d3.interpolateReds(0.7);
    const ratio = (count - minCount) / (maxCount - minCount);
    return d3.interpolateReds(0.4 + ratio * 0.5);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 3,
        justifyContent: "center",
        alignItems: "center",
        minHeight: 200,
        p: 4,
        bgcolor: "#f7f9fb",
        borderRadius: 2,
        border: "1px dashed",
        borderColor: "divider",
      }}
    >
      {words.map((word) => (
        <Box
          key={word.word}
          title={`${word.percentage}% (${word.count} occurrences)`}
          sx={{
            cursor: "pointer",
            transition: "transform 0.2s",
            "&:hover": {
              transform: "scale(1.1)",
            },
          }}
        >
          <Typography
            sx={{
              fontSize: getFontSize(word.count),
              fontWeight: 800,
              color: getColor(word.count),
              lineHeight: 1,
            }}
          >
            {word.word}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function GroupedBarChart({ summaries, models }) {
  let maxCount = 0;
  models.forEach((m) => {
    const s = summaries[m.key] ?? {};
    maxCount = Math.max(maxCount, s.spam_count ?? 0, s.ham_count ?? 0);
  });
  maxCount = maxCount || 1;

  return (
    <Card sx={cardSx} id="export-grouped-bar-chart">
      <CardContent
        sx={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
              Model Predictions (Count)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Absolute volume of Spam vs Ham flagged by each model.
            </Typography>
          </Box>
          <IconButton
            className="export-btn-hide"
            onClick={() => handleExportComponent("export-grouped-bar-chart", "model-predictions.png")}
            size="small"
            title="Download Image"
          >
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-around",
            height: 240,
            pt: 3,
            pb: 4,
            borderBottom: "1px solid",
            borderColor: "divider",
            position: "relative",
          }}
        >
          {models.map((model) => {
            const summary = summaries[model.key] ?? {};
            const spam = summary.spam_count ?? 0;
            const ham = summary.ham_count ?? 0;
            const spamHeight = (spam / maxCount) * 100;
            const hamHeight = (ham / maxCount) * 100;

            return (
              <Box
                key={model.key}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "20%",
                  position: "relative",
                  height: "100%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 1,
                    height: "100%",
                    width: "100%",
                    justifyContent: "center",
                  }}
                >
                  <Box
                    title={`Spam: ${spam}`}
                    sx={{
                      width: "40%",
                      maxWidth: 32,
                      height: `${spamHeight}%`,
                      bgcolor: "error.main",
                      borderRadius: "4px 4px 0 0",
                      transition: "height 0.5s ease",
                      position: "relative",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        position: "absolute",
                        top: "-22px",
                        fontWeight: 800,
                        color: "error.main",
                        fontSize: "12px",
                      }}
                    >
                      {spam}
                    </Typography>
                  </Box>
                  <Box
                    title={`Ham: ${ham}`}
                    sx={{
                      width: "40%",
                      maxWidth: 32,
                      height: `${hamHeight}%`,
                      bgcolor: "success.main",
                      borderRadius: "4px 4px 0 0",
                      transition: "height 0.5s ease",
                      position: "relative",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        position: "absolute",
                        top: "-22px",
                        fontWeight: 800,
                        color: "success.main",
                        fontSize: "12px",
                      }}
                    >
                      {ham}
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    position: "absolute",
                    bottom: -28,
                    textAlign: "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  {model.label
                    .replace(" Clustering", "")
                    .replace(" Regression", " Reg")}
                </Typography>
              </Box>
            );
          })}
        </Box>
        <Stack
          direction="row"
          justifyContent="center"
          spacing={3}
          sx={{ mt: 5 }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                width: 12,
                height: 12,
                bgcolor: "error.main",
                borderRadius: 0.5,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Spam
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                width: 12,
                height: 12,
                bgcolor: "success.main",
                borderRadius: 0.5,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Ham
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function CsvBatchDashboard({ result }) {
  if (!result) {
    return (
      <EmptyState
        title="CSV batch dashboard is empty"
        description="Upload a CSV with a body column, then run analysis to show model summaries and top spam words."
      />
    );
  }

  const summaries = result.model_summaries ?? {};
  const topWords = result.top_spam_words ?? [];

  return (
    <Stack spacing={3}>
      <Card sx={cardSx}>
        <CardContent>
          <Typography variant="overline" color="text.secondary">
            CSV Batch Summary
          </Typography>
          <Typography variant="h3" fontWeight={900}>
            {result.total_emails ?? 0}
          </Typography>
          <Typography color="text.secondary">Total emails processed</Typography>
        </CardContent>
      </Card>

      <Box>
        <GroupedBarChart summaries={summaries} models={MODELS} />
      </Box>

      <Card sx={cardSx}>
        <CardContent>
          <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>
            Top Spam Keywords
          </Typography>
          <SimpleWordCloud words={topWords} />

          <Alert
            severity="info"
            sx={{ mt: 3, "& .MuiAlert-message": { width: "100%" } }}
          >
            <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 0.5 }}>
              Understanding Special Tokens
            </Typography>
            <Typography variant="body2" color="text.secondary">
              During the content analysis, our AI automatically anonymizes and
              groups certain patterns. If you see words like{" "}
              <strong>phonenumber</strong>, <strong>url</strong>,{" "}
              <strong>email</strong>, <strong>percentage</strong>, or{" "}
              <strong>number</strong> in the cloud above, these represent
              categories of data found in the text rather than literal words.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    </Stack>
  );
}

const handleExportComponent = async (elementId, filename) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const exportBtns = element.querySelectorAll(".export-btn-hide");
  exportBtns.forEach(btn => btn.style.display = 'none');
  
  try {
    const canvas = await html2canvas(element, { backgroundColor: "#ffffff", scale: 2 });
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (err) {
    console.error("Export failed:", err);
  } finally {
    exportBtns.forEach(btn => btn.style.display = '');
  }
};

export default function SpamCheckPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [pastedEmailText, setPastedEmailText] = useState(SAMPLE_EMAIL);
  const [selectedSingleFile, setSelectedSingleFile] = useState(null);
  const [selectedCsvFile, setSelectedCsvFile] = useState(null);
  const [topNWords, setTopNWords] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [singleAnalysisResult, setSingleAnalysisResult] = useState(null);
  const [csvAnalysisResult, setCsvAnalysisResult] = useState(null);
  const [selectedModel, setSelectedModel] = useState("naive_bayes");
  const [highlightThreshold, setHighlightThreshold] = useState(50);
  const [selectedSentence, setSelectedSentence] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [featureAverages, setFeatureAverages] = useState(null);

  useEffect(() => {
    let isMounted = true;

    fetch(`${API_BASE_URL}/feature-averages`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (isMounted && payload) {
          setFeatureAverages(readData(payload));
        }
      })
      .catch(() => {
        if (isMounted) {
          setFeatureAverages(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const activePrediction = getModelPrediction(
    singleAnalysisResult,
    selectedModel,
  );
  const emailFeatures = singleAnalysisResult?.features ?? null;

  async function handleAnalyze() {
    try {
      setIsLoading(true);
      setErrorMessage("");
      setSelectedSentence(null);

      if (activeTab === 2) {
        if (!selectedCsvFile) {
          throw new Error("Select a CSV file before running batch analysis.");
        }

        const formData = new FormData();
        formData.append("file", selectedCsvFile);

        const response = await fetch(
          `${API_BASE_URL}/predict/csv?top_n=${topNWords}`,
          { method: "POST", body: formData },
        );
        const payload = await response.json();
        if (!response.ok || payload.success === false) {
          throw new Error(payload.error || "CSV batch prediction failed.");
        }

        setCsvAnalysisResult(readData(payload));
        setSingleAnalysisResult(null);
        return;
      }

      const formData = new FormData();
      if (activeTab === 0) {
        if (!pastedEmailText.trim()) {
          throw new Error("Paste email content before analysis.");
        }
        formData.append("body", pastedEmailText);
      } else {
        if (!selectedSingleFile) {
          throw new Error("Select an email file before analysis.");
        }
        formData.append("file", selectedSingleFile);
      }

      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();
      if (!response.ok || payload.success === false) {
        throw new Error(payload.error || "Email prediction failed.");
      }

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
      <Box sx={{ mb: 2.5, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
            Email Spam Detector
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 700, lineHeight: 1.6 }}>
            Powered by machine learning models trained via Scikit-Learn (Naive Bayes, K-Means Clustering, Logistic Regression, and Linear SVM).
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

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: activeTab === 2 ? "1fr" : "minmax(0, 8fr) minmax(280px, 4fr)",
          },
          gap: 2,
          mb: 2,
          "@media print": {
            display: "block",
            mb: 0,
          },
        }}
      >
        <Card sx={{ ...cardSx, "@media print": { display: "none" } }}>
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Tabs
              value={activeTab}
              onChange={(_, value) => setActiveTab(value)}
            >
              <Tab label="Raw Text Paste" />
              <Tab label="File Upload" />
              <Tab label="Batch CSV" />
            </Tabs>
            <Divider sx={{ mb: 2 }} />

            {activeTab === 0 ? (
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
            ) : null}

            {activeTab === 1 ? (
              <UploadZone
                accept=".eml,.msg,.txt"
                file={selectedSingleFile}
                label="Upload a single email file"
                helperText="Accepted formats: .eml, .msg, .txt"
                onChange={setSelectedSingleFile}
                onClear={() => setSelectedSingleFile(null)}
              />
            ) : null}

            {activeTab === 2 ? (
              <Stack spacing={2}>
                <UploadZone
                  accept=".csv"
                  file={selectedCsvFile}
                  label="Upload a CSV batch"
                  helperText="CSV must include a body column. A subject column is optional."
                  onChange={setSelectedCsvFile}
                  onClear={() => setSelectedCsvFile(null)}
                />
                <TextField
                  label="Top spam keywords"
                  type="number"
                  size="small"
                  value={topNWords}
                  onChange={(event) =>
                    setTopNWords(
                      Math.max(
                        5,
                        Math.min(30, Number(event.target.value) || 10),
                      ),
                    )
                  }
                  slotProps={{ htmlInput: { min: 5, max: 30 } }}
                  sx={{ maxWidth: 220 }}
                />
              </Stack>
            ) : null}

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
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Analyze Content"
                )}
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {activeTab !== 2 && (
          <OverallAssessment prediction={activePrediction} />
        )}
      </Box>

      {activeTab === 2 || csvAnalysisResult ? (
        <CsvBatchDashboard result={csvAnalysisResult} />
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
            <FeatureRadarChart
              features={emailFeatures}
              averages={featureAverages}
            />
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
            <SentenceTokenCard
              sentence={selectedSentence}
              selectedModel={selectedModel}
            />
          </Box>
        </Stack>
      )}

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
