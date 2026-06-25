import { useEffect, useMemo, useRef, useState } from "react"
import * as d3 from "d3"
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
  InputLabel,
  LinearProgress,
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
} from "@mui/material"

const API_BASE_URL = "http://localhost:8000/api/v1"

const SAMPLE_EMAIL = `Return-Path: <offers@unbelievable-prizes.com>
Subject: URGENT: Your Account Has Been Selected for a $50,000 Payout!
Date: Thu, 24 Aug 2024 14:22:10 +0000

Dear Valued Customer,

Congratulations! You have been exclusively selected to receive a one-time cash payout of $50,000 USD. This is not a drill!`

const MODELS = [
  { key: "naive_bayes", label: "Naive Bayes" },
  { key: "k_means", label: "K-Means Clustering" },
  { key: "logistic_regression", label: "Logistic Regression" },
  { key: "linear_svm", label: "Linear SVM" },
]

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
]

const cardSx = {
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1.5,
  boxShadow: "none",
}

function percent(value) {
  return Math.round(Number(value || 0) * 100)
}

function readData(payload) {
  return payload?.data ?? payload
}

function getModelPrediction(result, modelKey) {
  return result?.models?.[modelKey] ?? null
}

function getConfidence(prediction) {
  return percent(prediction?.confidence)
}

function verdictColor(label) {
  if (label === "spam") {
    return "error"
  }
  if (label === "ham") {
    return "success"
  }
  return "text.secondary"
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
  )
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
        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
          <Chip label={file.name} onDelete={onClear} variant="outlined" />
        </Stack>
      ) : null}
    </Box>
  )
}

function ConfidenceGauge({ value, label }) {
  const safeValue = Math.max(0, Math.min(100, value))

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
  )
}

function EmptyRadarPlot() {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems="center" sx={{ mt: 2 }}>
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
            <Box sx={{ width: 10, height: 10, bgcolor: color, borderRadius: 0.5 }} />
            <Typography variant="caption">{label}</Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  )
}

function ModelComparison({ result, selectedModel, onSelectedModelChange }) {
  const predictions = MODELS.map((model) => ({
    ...model,
    prediction: getModelPrediction(result, model.key),
  }))

  return (
    <Card sx={cardSx}>
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Model Comparison & Distribution
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Compare spam and safe probabilities across all classifiers.
            </Typography>
          </Box>
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
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "minmax(220px, 0.9fr) minmax(0, 2fr)" },
            gap: 3,
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 1.5,
            }}
          >
            {predictions.map(({ key, label, prediction }) => (
              <Paper
                key={key}
                variant="outlined"
                sx={{
                  p: 1.5,
                  minHeight: 116,
                  borderRadius: 1.5,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  borderColor: selectedModel === key ? "text.primary" : "divider",
                }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary" textTransform="uppercase">
                    {label}
                  </Typography>
                  <Typography
                    fontWeight={900}
                    color={
                      prediction?.label
                        ? `${verdictColor(prediction.label)}.main`
                        : "text.secondary"
                    }
                  >
                    {getConfidence(prediction)}%{" "}
                    <Box component="span" sx={{ fontSize: 11, textTransform: "uppercase" }}>
                      {prediction?.label ?? "Pending"}
                    </Box>
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.max(
                    percent(prediction?.spam_probability),
                    percent(prediction?.ham_probability),
                  )}
                  color={prediction?.label === "ham" ? "success" : "error"}
                  sx={{ height: 6, borderRadius: 1 }}
                />
              </Paper>
            ))}
          </Box>

          <Box sx={{ minHeight: 220, display: "grid", gridTemplateColumns: "36px 1fr", gap: 1 }}>
            <Stack justifyContent="space-between" alignItems="flex-end" sx={{ pb: 3 }}>
              {[100, 50, 0].map((tick) => (
                <Typography key={tick} variant="caption" color="text.secondary">
                  {tick}%
                </Typography>
              ))}
            </Stack>
            <Box
              sx={{
                position: "relative",
                borderBottom: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-around",
                gap: 2,
                px: 2,
                pb: 3,
                background:
                  "linear-gradient(to bottom, rgba(198,198,205,.35) 1px, transparent 1px) 0 0 / 100% 50%",
              }}
            >
              {predictions.map(({ key, label, prediction }) => {
                const spam = percent(prediction?.spam_probability)
                const ham = percent(prediction?.ham_probability)
                return (
                  <Box
                    key={key}
                    sx={{
                      height: 180,
                      flex: 1,
                      minWidth: 44,
                      display: "flex",
                      alignItems: "flex-end",
                      gap: 0.5,
                      position: "relative",
                    }}
                  >
                    <Box sx={{ flex: 1, height: `${spam}%`, bgcolor: "error.main", borderRadius: "4px 4px 0 0" }} />
                    <Box sx={{ flex: 1, height: `${ham}%`, bgcolor: "#22c55e", borderRadius: "4px 4px 0 0" }} />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        position: "absolute",
                        left: "50%",
                        bottom: -28,
                        transform: "translateX(-50%)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {label.replace(" Clustering", "").replace(" Regression", " Reg")}
                    </Typography>
                  </Box>
                )
              })}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

function OverallAssessment({ prediction }) {
  if (!prediction) {
    return (
      <Card sx={cardSx}>
        <CardContent sx={{ p: 2, textAlign: "center", "&:last-child": { pb: 2 } }}>
          <Typography variant="caption" color="text.secondary" display="block" textAlign="left" textTransform="uppercase">
            Consensus Verdict
          </Typography>
          <Box sx={{ my: 2 }}>
            <ConfidenceGauge value={0} label="ham" />
          </Box>
          <Chip
            variant="outlined"
            label="WAITING FOR ANALYSIS"
            sx={{ fontWeight: 800, fontSize: 11 }}
          />
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            Confidence appears after content analysis.
          </Typography>
        </CardContent>
      </Card>
    )
  }

  const isSpam = prediction.label === "spam"

  return (
    <Card sx={cardSx}>
      <CardContent sx={{ p: 2, textAlign: "center", "&:last-child": { pb: 2 } }}>
        <Typography variant="caption" color="text.secondary" display="block" textAlign="left" textTransform="uppercase">
          Consensus Verdict
        </Typography>
        <Box sx={{ my: 2 }}>
          <ConfidenceGauge
            value={getConfidence(prediction)}
            label={prediction.label}
          />
        </Box>
        <Chip
          color={isSpam ? "error" : "success"}
          label={isSpam ? "CLASSIFIED AS SPAM" : "CLASSIFIED AS SAFE (HAM)"}
          sx={{ fontWeight: 800, px: 1, fontSize: 11 }}
        />
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          Confidence from the selected active classifier.
        </Typography>
      </CardContent>
    </Card>
  )
}

function FeatureRadarChart({ features, averages }) {
  const svgRef = useRef(null)
  const hasEmailFeatures = Boolean(features && Object.keys(features).length)

  const series = useMemo(
    () => [
      { key: "email", label: "This Email", color: "#000000", values: features },
      { key: "spam", label: "Spam Average", color: "#ba1a1a", values: averages?.spam },
      { key: "ham", label: "Ham Average", color: "#2e7d32", values: averages?.ham },
    ],
    [averages, features],
  )

  const maxByFeature = useMemo(() => {
    return FEATURE_AXES.reduce((acc, axis) => {
      const max = Math.max(
        1,
        ...series.map((item) => Number(item.values?.[axis.key] ?? 0)),
      )
      acc[axis.key] = max
      return acc
    }, {})
  }, [series])

  useEffect(() => {
    if (!hasEmailFeatures || !svgRef.current) {
      return
    }

    const width = 260
    const height = 260
    const center = width / 2
    const radius = 92
    const angleFor = (index) =>
      (Math.PI * 2 * index) / FEATURE_AXES.length - Math.PI / 2
    const pointFor = (axisIndex, value) => {
      const angle = angleFor(axisIndex)
      const scaledRadius = radius * Math.max(0, Math.min(1, value))
      return [
        center + Math.cos(angle) * scaledRadius,
        center + Math.sin(angle) * scaledRadius,
      ]
    }
    const pointsFor = (values) =>
      FEATURE_AXES.map((axis, index) => {
        const normalized =
          Number(values?.[axis.key] ?? 0) / maxByFeature[axis.key]
        return pointFor(index, normalized)
      })

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()
    svg.attr("viewBox", `0 0 ${width} ${height}`)

    const line = d3.line().curve(d3.curveLinearClosed)

    svg
      .selectAll(".radar-grid")
      .data([0.25, 0.5, 0.75, 1])
      .join("path")
      .attr("class", "radar-grid")
      .attr("d", (level) => line(FEATURE_AXES.map((_, index) => pointFor(index, level))))
      .attr("fill", "none")
      .attr("stroke", "#d8dadc")
      .attr("stroke-width", 1)

    const axes = svg
      .selectAll(".radar-axis")
      .data(FEATURE_AXES)
      .join("g")
      .attr("class", "radar-axis")

    axes
      .append("line")
      .attr("x1", center)
      .attr("y1", center)
      .attr("x2", (_, index) => pointFor(index, 1)[0])
      .attr("y2", (_, index) => pointFor(index, 1)[1])
      .attr("stroke", "#d8dadc")

    axes
      .append("text")
      .attr("x", (_, index) => pointFor(index, 1.17)[0])
      .attr("y", (_, index) => pointFor(index, 1.17)[1])
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-size", 10)
      .attr("fill", "#45464d")
      .text((axis) => axis.label)

    const visibleSeries = series.filter((item) => item.values)
    const polygons = svg
      .selectAll(".radar-series")
      .data(visibleSeries)
      .join("path")
      .attr("class", "radar-series")
      .attr("d", (item) => line(pointsFor(item.values)))
      .attr("fill", (item) => item.color)
      .attr("fill-opacity", 0)
      .attr("stroke", (item) => item.color)
      .attr("stroke-width", 2)

    polygons
      .transition()
      .duration(700)
      .attr("fill-opacity", 0.08)

    visibleSeries.forEach((item) => {
      svg
        .selectAll(`.radar-point-${item.key}`)
        .data(FEATURE_AXES)
        .join("circle")
        .attr("class", `radar-point-${item.key}`)
        .attr("cx", (axis, index) => {
          const normalized =
            Number(item.values?.[axis.key] ?? 0) / maxByFeature[axis.key]
          return pointFor(index, normalized)[0]
        })
        .attr("cy", (axis, index) => {
          const normalized =
            Number(item.values?.[axis.key] ?? 0) / maxByFeature[axis.key]
          return pointFor(index, normalized)[1]
        })
        .attr("r", 3)
        .attr("fill", item.color)
        .append("title")
        .text((axis) => `${item.label} ${axis.label}: ${item.values?.[axis.key] ?? 0}`)
    })
  }, [hasEmailFeatures, maxByFeature, series])

  return (
    <Card sx={cardSx}>
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Typography variant="caption" color="text.secondary" display="block">
          Feature Analysis
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Compares extracted content signals against training averages.
        </Typography>

        {!hasEmailFeatures ? (
          <EmptyRadarPlot />
        ) : (
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            alignItems="center"
            sx={{ mt: 3 }}
          >
            <Box
              component="svg"
              ref={svgRef}
              role="img"
              aria-label="Feature radar chart"
              sx={{ width: 260, maxWidth: "100%" }}
            />
            <Stack spacing={1}>
              {series.map((item) => (
                <Stack key={item.key} direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: 0.5,
                      bgcolor: item.color,
                    }}
                  />
                  <Typography variant="body2">{item.label}</Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        )}
      </CardContent>
    </Card>
  )
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
            Interactive Heatmap
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
              Analyze content to highlight sentence-level spam probability.
            </Typography>
          </Paper>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card sx={cardSx}>
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Interactive Heatmap
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Click a highlighted sentence to inspect model probabilities.
            </Typography>
          </Box>
          <Box sx={{ minWidth: { xs: "100%", md: 260 } }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                Highlight Threshold
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
          }}
        >
          {sentences.map((sentence, index) => {
            const prediction = sentence.models?.[selectedModel]
            const spamProbability = percent(prediction?.spam_probability)
            const isHighlighted = spamProbability >= threshold
            const opacity = Math.max(0.12, spamProbability / 100)

            return (
              <Box
                component="button"
                key={`${sentence.text}-${index}`}
                title={`${spamProbability}% spam probability`}
                onClick={() => onSentenceSelect(sentence)}
                sx={{
                  display: "inline",
                  border: 0,
                  borderRadius: 1,
                  mx: 0.25,
                  px: 0.6,
                  py: 0.25,
                  cursor: "pointer",
                  font: "inherit",
                  color: isHighlighted ? "#5f1515" : "text.primary",
                  bgcolor: isHighlighted
                    ? `rgba(186, 26, 26, ${opacity * 0.22})`
                    : "transparent",
                  outline:
                    selectedSentence?.text === sentence.text
                      ? "1px solid #ba1a1a"
                      : "none",
                  "&:hover": { bgcolor: "grey.200" },
                }}
              >
                {sentence.text}
              </Box>
            )
          })}
        </Paper>
      </CardContent>
    </Card>
  )
}

function SentenceTokenCard({ sentence, selectedModel }) {
  const [tokenData, setTokenData] = useState(null)
  const [isLoadingTokens, setIsLoadingTokens] = useState(false)

  useEffect(() => {
    if (!sentence) {
      setTokenData(null)
      return
    }

    let cancelled = false
    setIsLoadingTokens(true)
    setTokenData(null)

    fetch(`${API_BASE_URL}/predict/sentence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sentence: sentence.text }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (!cancelled && payload?.success) {
          setTokenData(readData(payload))
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoadingTokens(false)
      })

    return () => {
      cancelled = true
    }
  }, [sentence])

  return (
    <Card sx={cardSx}>
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
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
            Click a sentence in the heatmap to inspect its top spam-triggering tokens.
          </Typography>
        ) : isLoadingTokens ? (
          <Stack alignItems="center" sx={{ py: 2 }}>
            <CircularProgress size={24} />
          </Stack>
        ) : tokenData?.tokens?.length ? (
          <Stack spacing={1}>
            {tokenData.tokens
              .map((t) => ({
                word: t.token,
                score: percent(t.models?.[selectedModel]?.spam_probability),
              }))
              .sort((a, b) => b.score - a.score)
              .slice(0, 6)
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
                    sx={{ height: 24, fontWeight: 800, bgcolor: kw.score >= 50 ? "#ffdad6" : undefined }}
                  />
                </Paper>
              ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No keyword tokens found for this sentence.
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}


function CsvBatchDashboard({ result }) {
  if (!result) {
    return (
      <EmptyState
        title="CSV batch dashboard is empty"
        description="Upload a CSV with a body column, then run analysis to show model summaries and top spam words."
      />
    )
  }

  const summaries = result.model_summaries ?? {}
  const topWords = result.top_spam_words ?? []

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

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
          gap: 2,
        }}
      >
        {MODELS.map((model) => {
          const summary = summaries[model.key] ?? {}
          const spamCount = summary.spam_count ?? 0
          const hamCount = summary.ham_count ?? 0
          const total = spamCount + hamCount || 1
          const spamShare = Math.round((spamCount / total) * 100)

          return (
            <Card key={model.key} sx={cardSx}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={800}>
                  {model.label}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={spamShare}
                  color="error"
                  sx={{ height: 10, borderRadius: 1, my: 1.5 }}
                />
                <Typography variant="body2" color="error.main">
                  Spam: {spamCount} ({spamShare}%)
                </Typography>
                <Typography variant="body2" color="success.main">
                  Ham: {hamCount} ({100 - spamShare}%)
                </Typography>
              </CardContent>
            </Card>
          )
        })}
      </Box>

      <Card sx={cardSx}>
        <CardContent>
          <Typography variant="h5" fontWeight={800}>
            Top Spam Keywords
          </Typography>
          <Stack spacing={1.5} sx={{ mt: 2 }}>
            {topWords.length ? (
              topWords.map((word) => (
                <Box key={word.word}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography fontWeight={800}>{word.word}</Typography>
                    <Typography color="text.secondary">
                      {word.percentage}% ({word.count} count)
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={word.percentage}
                    sx={{ height: 9, borderRadius: 1, mt: 0.5 }}
                  />
                </Box>
              ))
            ) : (
              <Typography color="text.secondary">
                No spam keywords were returned for this batch.
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}

export default function SpamCheckPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [pastedEmailText, setPastedEmailText] = useState(SAMPLE_EMAIL)
  const [selectedSingleFile, setSelectedSingleFile] = useState(null)
  const [selectedCsvFile, setSelectedCsvFile] = useState(null)
  const [topNWords, setTopNWords] = useState(10)
  const [isLoading, setIsLoading] = useState(false)
  const [singleAnalysisResult, setSingleAnalysisResult] = useState(null)
  const [csvAnalysisResult, setCsvAnalysisResult] = useState(null)
  const [selectedModel, setSelectedModel] = useState("naive_bayes")
  const [highlightThreshold, setHighlightThreshold] = useState(50)
  const [selectedSentence, setSelectedSentence] = useState(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [featureAverages, setFeatureAverages] = useState(null)

  useEffect(() => {
    let isMounted = true

    fetch(`${API_BASE_URL}/feature-averages`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (isMounted && payload) {
          setFeatureAverages(readData(payload))
        }
      })
      .catch(() => {
        if (isMounted) {
          setFeatureAverages(null)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const activePrediction = getModelPrediction(singleAnalysisResult, selectedModel)
  const emailFeatures = singleAnalysisResult?.features ?? null

  async function handleAnalyze() {
    try {
      setIsLoading(true)
      setErrorMessage("")
      setSelectedSentence(null)

      if (activeTab === 2) {
        if (!selectedCsvFile) {
          throw new Error("Select a CSV file before running batch analysis.")
        }

        const formData = new FormData()
        formData.append("file", selectedCsvFile)

        const response = await fetch(
          `${API_BASE_URL}/predict/csv?top_n=${topNWords}`,
          { method: "POST", body: formData },
        )
        const payload = await response.json()
        if (!response.ok || payload.success === false) {
          throw new Error(payload.error || "CSV batch prediction failed.")
        }

        setCsvAnalysisResult(readData(payload))
        setSingleAnalysisResult(null)
        return
      }

      const formData = new FormData()
      if (activeTab === 0) {
        if (!pastedEmailText.trim()) {
          throw new Error("Paste email content before analysis.")
        }
        formData.append("body", pastedEmailText)
      } else {
        if (!selectedSingleFile) {
          throw new Error("Select an email file before analysis.")
        }
        formData.append("file", selectedSingleFile)
      }

      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        body: formData,
      })
      const payload = await response.json()
      if (!response.ok || payload.success === false) {
        throw new Error(payload.error || "Email prediction failed.")
      }

      setSingleAnalysisResult(readData(payload))
      setCsvAnalysisResult(null)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box sx={{ pb: 3 }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h4" fontWeight={800}>
          Email Checker
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Multi-model AI consensus analysis for email safety.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 8fr) minmax(280px, 4fr)" },
          gap: 2,
          mb: 2,
        }}
      >
        <Card sx={cardSx}>
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
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
                      Math.max(5, Math.min(30, Number(event.target.value) || 10)),
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

        <OverallAssessment prediction={activePrediction} />
      </Box>

      {activeTab === 2 || csvAnalysisResult ? (
        <CsvBatchDashboard result={csvAnalysisResult} />
      ) : (
        <Stack spacing={2}>
          <ModelComparison
            result={singleAnalysisResult}
            selectedModel={selectedModel}
            onSelectedModelChange={setSelectedModel}
          />

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
            <Stack spacing={2}>
              <FeatureRadarChart
                features={emailFeatures}
                averages={featureAverages}
              />
              <SentenceTokenCard
                sentence={selectedSentence}
                selectedModel={selectedModel}
              />
            </Stack>
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
  )
}
