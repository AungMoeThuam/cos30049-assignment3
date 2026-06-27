import DownloadIcon from "@mui/icons-material/Download";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { EmptyState } from "./EmptyState";
import { MODELS, cardSx, handleExportComponent } from "./constants";

// ─── SimpleWordCloud ──────────────────────────────────────────────────────────

function SimpleWordCloud({ words }) {
  if (!words || words.length === 0) {
    return (
      <Typography color="text.secondary">
        No spam keywords were returned for this batch.
      </Typography>
    );
  }

  const width = 500;
  const height = 250;
  const maxCount = Math.max(...words.map((w) => w.count), 1);
  const minCount = Math.min(...words.map((w) => w.count), 0);

  const getFontSize = (count) => {
    if (maxCount === minCount) return 24;
    const ratio = (count - minCount) / (maxCount - minCount);
    return Math.round(12 + ratio * 28);
  };

  const getWordColor = (percentage) => {
    if (percentage >= 80) return "#b91c1c";
    if (percentage >= 50) return "#ca8a04";
    return "#64748b";
  };

  const placed = [];
  const intersects = (b1, b2) =>
    b1.x < b2.x + b2.width &&
    b1.x + b1.width > b2.x &&
    b1.y < b2.y + b2.height &&
    b1.y + b1.height > b2.y;

  const sortedWords = [...words].sort((a, b) => b.count - a.count);

  sortedWords.forEach((wordInfo) => {
    const text = wordInfo.word.toUpperCase();
    const fontSize = getFontSize(wordInfo.count);
    const w = text.length * fontSize * 0.55;
    const h = fontSize;

    let x = width / 2;
    let y = height / 2;
    let theta = Math.random() * Math.PI * 2;
    let radius = 0;
    let found = false;
    let attempts = 0;
    const maxAttempts = 1000;

    while (!found && attempts < maxAttempts) {
      attempts++;
      const box = { x: x - w / 2, y: y - h / 2, width: w, height: h };
      const padding = 2;
      const paddedBox = {
        x: box.x - padding,
        y: box.y - padding,
        width: box.width + padding * 2,
        height: box.height + padding * 2,
      };

      const overlap =
        placed.some((other) => intersects(paddedBox, other)) ||
        box.x < 5 ||
        box.x + box.width > width - 5 ||
        box.y < 5 ||
        box.y + box.height > height - 5;

      if (!overlap) {
        placed.push({ ...box, word: text, fontSize, percentage: wordInfo.percentage, count: wordInfo.count });
        found = true;
      } else {
        radius += 0.5;
        theta += 0.12;
        x = width / 2 + Math.cos(theta) * radius;
        y = height / 2 + Math.sin(theta) * radius;
      }
    }

    if (!found) {
      placed.push({
        x: Math.random() * (width - w - 10) + 5,
        y: Math.random() * (height - h - 10) + 5,
        width: w,
        height: h,
        word: text,
        fontSize,
        percentage: wordInfo.percentage,
        count: wordInfo.count,
      });
    }
  });

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: 260,
        p: 2,
        bgcolor: "#f8fafc",
        borderRadius: 2,
        border: "1px dashed",
        borderColor: "divider",
      }}
    >
      <Box
        component="svg"
        viewBox={`0 0 ${width} ${height}`}
        sx={{ width: "100%", height: "100%", maxHeight: height, overflow: "visible" }}
      >
        {placed.map((item, idx) => (
          <text
            key={`${item.word}-${idx}`}
            x={item.x + item.width / 2}
            y={item.y + item.height - item.fontSize * 0.1}
            textAnchor="middle"
            title={`${item.percentage}% of spam emails contain this (${item.count} occurrences)`}
            style={{
              fontSize: `${item.fontSize}px`,
              fontWeight: 900,
              fill: getWordColor(item.percentage),
              fontFamily: '"Impact", "Anton", "Arial Black", sans-serif',
              cursor: "default",
              transition: "transform 0.15s ease, fill-opacity 0.15s ease",
              transformOrigin: `${item.x + item.width / 2}px ${item.y + item.height / 2}px`,
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "scale(1.15)";
              e.target.style.fillOpacity = "0.8";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "scale(1)";
              e.target.style.fillOpacity = "1";
            }}
          >
            {item.word}
          </text>
        ))}
      </Box>
    </Box>
  );
}

// ─── GroupedBarChart ──────────────────────────────────────────────────────────

function GroupedBarChart({ summaries, models }) {
  let maxCount = 0;
  models.forEach((m) => {
    const s = summaries[m.key] ?? {};
    maxCount = Math.max(maxCount, s.spam_count ?? 0, s.ham_count ?? 0);
  });
  maxCount = maxCount || 1;

  return (
    <Card sx={{ ...cardSx, height: "100%", position: "relative" }} id="export-grouped-bar-chart">
      <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ pr: 5 }}>
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
              Model Predictions (Count)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Absolute volume of Spam vs Ham flagged by each model.
            </Typography>
          </Box>
        </Stack>
        <IconButton
          className="export-btn-hide"
          onClick={() =>
            handleExportComponent("export-grouped-bar-chart", "model-predictions.png")
          }
          size="small"
          title="Download Image"
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "50%",
            p: 0.75,
            transition: "all 0.2s ease-in-out",
            bgcolor: "background.paper",
            color: "text.secondary",
            zIndex: 1,
            "&:hover": {
              bgcolor: "action.hover",
              color: "text.primary",
              transform: "scale(1.08)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            },
          }}
        >
          <DownloadIcon fontSize="small" />
        </IconButton>

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
                      width: "45%",
                      maxWidth: 56,
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
                      sx={{ position: "absolute", top: "-22px", fontWeight: 800, color: "error.main", fontSize: "12px" }}
                    >
                      {spam}
                    </Typography>
                  </Box>
                  <Box
                    title={`Ham: ${ham}`}
                    sx={{
                      width: "45%",
                      maxWidth: 56,
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
                      sx={{ position: "absolute", top: "-22px", fontWeight: 800, color: "success.main", fontSize: "12px" }}
                    >
                      {ham}
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ position: "absolute", bottom: -28, textAlign: "center", whiteSpace: "nowrap" }}
                >
                  {model.label.replace(" Clustering", "").replace(" Regression", " Reg")}
                </Typography>
              </Box>
            );
          })}
        </Box>
        <Stack
          direction="row"
          justifyContent="center"
          style={{ paddingTop: "1rem", margin: "auto" }}
          spacing={3}
          sx={{ mt: 5 }}
        >
          {[
            { color: "error.main", label: "Spam" },
            { color: "success.main", label: "Ham" },
          ].map(({ color, label }) => (
            <Stack key={label} direction="row" alignItems="center" spacing={1}>
              <Box sx={{ width: 12, height: 12, flexShrink: 0, bgcolor: color, borderRadius: 0.5 }} />
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                {label}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

// ─── ConfidenceStreamGraph ────────────────────────────────────────────────────

function ConfidenceStreamGraph({ summaries }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!summaries || !svgRef.current) return;

    const bins = [
      "0-10%", "10-20%", "20-30%", "30-40%", "40-50%",
      "50-60%", "60-70%", "70-80%", "80-90%", "90-100%",
    ];

    const data = bins.map((bin) => {
      const row = { bin };
      MODELS.forEach((m) => {
        row[m.key] = summaries[m.key]?.confidence_distribution[bin] || 0;
      });
      return row;
    });

    const keys = MODELS.map((m) => m.key);
    const series = d3.stack().keys(keys)(data);

    const width = 800;
    const height = 400;
    const margin = { top: 40, right: 30, bottom: 40, left: 50 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg
      .attr("viewBox", [0, 0, width, height])
      .attr("width", "100%")
      .attr("height", "100%")
      .style("display", "block");

    const x = d3.scalePoint().domain(bins).range([margin.left, width - margin.right]);
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(series, (d) => d3.max(d, (d) => d[1]))])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const color = d3
      .scaleOrdinal()
      .domain(keys)
      .range(["#4285F4", "#0F9D58", "#F4B400", "#DB4437"]);

    const area = d3
      .area()
      .curve(d3.curveMonotoneX)
      .x((d) => x(d.data.bin))
      .y0((d) => y(d[0]))
      .y1((d) => y(d[1]));

    const tooltip = d3
      .select(svgRef.current.parentNode)
      .selectAll(".stream-tooltip")
      .data([0])
      .join("div")
      .attr("class", "stream-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "rgba(255, 255, 255, 0.95)")
      .style("border", "1px solid #e2e8f0")
      .style("border-radius", "6px")
      .style("padding", "8px 12px")
      .style("box-shadow", "0 4px 6px -1px rgba(0, 0, 0, 0.1)")
      .style("pointer-events", "none")
      .style("font-size", "12px")
      .style("color", "#0f172a")
      .style("font-family", '"Inter", "Roboto", sans-serif')
      .style("z-index", "10");

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .call((g) => g.select(".domain").attr("stroke", "#cbd5e1"))
      .selectAll("text")
      .attr("y", 12)
      .style("font-family", '"Inter", "Roboto", sans-serif')
      .style("font-size", "11px")
      .style("fill", "#64748b");

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(6))
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .selectAll(".tick line")
          .attr("stroke", "#e2e8f0")
          .attr("stroke-dasharray", "4 4")
          .attr("x2", width - margin.left - margin.right),
      )
      .selectAll("text")
      .style("font-family", '"Inter", "Roboto", sans-serif')
      .style("font-size", "11px")
      .style("fill", "#64748b");

    svg
      .append("g")
      .selectAll("path")
      .data(series)
      .join("path")
      .attr("fill", (d) => color(d.key))
      .attr("d", area)
      .attr("opacity", 0.85)
      .style("transition", "opacity 0.2s ease")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("opacity", 1);
        const modelLabel = MODELS.find((m) => m.key === d.key)?.label;
        tooltip.style("visibility", "visible").html(`<strong>${modelLabel}</strong>`);
      })
      .on("mousemove", function (event) {
        const [mx, my] = d3.pointer(event);
        tooltip.style("top", my - 40 + "px").style("left", mx + 10 + "px");
      })
      .on("mouseout", function () {
        d3.select(this).attr("opacity", 0.85);
        tooltip.style("visibility", "hidden");
      });

    const legend = svg.append("g").attr("transform", `translate(${margin.left}, 15)`);
    MODELS.forEach((m, i) => {
      const legendRow = legend.append("g").attr("transform", `translate(${i * 150}, 0)`);
      legendRow.append("rect").attr("width", 12).attr("height", 12).attr("fill", color(m.key)).attr("rx", 3);
      legendRow
        .append("text")
        .attr("x", 20)
        .attr("y", 10)
        .text(m.label.replace(" Clustering", "").replace(" Regression", " Reg"))
        .style("font-size", "12px")
        .style("font-family", '"Inter", "Roboto", sans-serif')
        .style("fill", "#475569")
        .style("font-weight", 600);
    });
  }, [summaries]);

  return (
    <Card sx={{ ...cardSx, height: "100%" }} id="export-confidence-stream">
      <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
              Cumulative Confidence Flow (All Models)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Stacked area chart visualizing the total volume of emails per confidence bucket across all models.
            </Typography>
          </Box>
          <IconButton
            className="export-btn-hide"
            onClick={() =>
              handleExportComponent("export-confidence-stream", "confidence-streamgraph.png")
            }
            size="small"
            title="Download Image"
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "50%",
              p: 0.75,
              transition: "all 0.2s ease-in-out",
              bgcolor: "background.paper",
              color: "text.secondary",
              "&:hover": {
                bgcolor: "action.hover",
                color: "text.primary",
                transform: "scale(1.08)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              },
            }}
          >
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box sx={{ width: "100%", position: "relative", flex: 1, minHeight: 300 }}>
          <svg ref={svgRef} />
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── CsvBatchDashboard ────────────────────────────────────────────────────────

export function CsvBatchDashboard({ result, activeModel }) {
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

  const modelKeys = Object.keys(summaries);
  const numModels = Math.max(1, modelKeys.length);
  const totalSpam = modelKeys.reduce((sum, key) => sum + (summaries[key]?.spam_count || 0), 0);
  const totalHam = modelKeys.reduce((sum, key) => sum + (summaries[key]?.ham_count || 0), 0);
  const totalConf = modelKeys.reduce((sum, key) => sum + (summaries[key]?.average_confidence || 0), 0);
  const avgSpam = Math.round(totalSpam / numModels);
  const avgHam = Math.round(totalHam / numModels);
  const avgConf = Math.round((totalConf / numModels) * 100);

  return (
    <Stack spacing={2}>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "3fr 9fr" }, gap: 2 }}>
        <Card sx={{ ...cardSx, height: "100%", display: "flex", alignItems: "center" }}>
          <CardContent sx={{ py: { xs: 4, lg: 0 }, width: "100%" }}>
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="overline"
                color="primary.main"
                fontWeight={800}
                sx={{ letterSpacing: 1 }}
                display="block"
              >
                CSV BATCH SUMMARY
              </Typography>
              <Typography variant="h2" fontWeight={900} sx={{ mt: 1, mb: 0, color: "text.primary" }}>
                {result.total_emails ?? 0}
              </Typography>
              <Typography color="text.secondary" variant="body1" fontWeight={500}>
                Total emails successfully processed
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
                <Box sx={{ flex: 1, bgcolor: "#fef2f2", p: 2, borderRadius: 2, border: "1px solid", borderColor: "#fecaca" }}>
                  <Typography variant="h4" fontWeight={900} color="#ef4444">{avgSpam}</Typography>
                  <Typography variant="caption" color="#b91c1c" fontWeight={700} textTransform="uppercase" sx={{ letterSpacing: 0.5 }}>
                    Avg Spam
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, bgcolor: "#f0fdf4", p: 2, borderRadius: 2, border: "1px solid", borderColor: "#bbf7d0" }}>
                  <Typography variant="h4" fontWeight={900} color="#22c55e">{avgHam}</Typography>
                  <Typography variant="caption" color="#15803d" fontWeight={700} textTransform="uppercase" sx={{ letterSpacing: 0.5 }}>
                    Avg Ham
                  </Typography>
                </Box>
              </Stack>

              <Box sx={{ display: "flex", alignItems: "center", gap: 3, bgcolor: "#eff6ff", p: 2, borderRadius: 2, border: "1px solid", borderColor: "#bfdbfe" }}>
                <Box sx={{ position: "relative", display: "inline-flex" }}>
                  <CircularProgress variant="determinate" value={100} size={56} thickness={5} sx={{ color: "#dbeafe", position: "absolute" }} />
                  <CircularProgress variant="determinate" value={avgConf} size={56} thickness={5} sx={{ color: "#3b82f6" }} />
                  <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Typography variant="caption" fontWeight={800} color="#1d4ed8">{avgConf}%</Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={800} color="#1e40af" sx={{ lineHeight: 1.2 }}>
                    Average Confidence
                  </Typography>
                  <Typography variant="caption" color="#3b82f6" fontWeight={600} sx={{ opacity: 0.9 }}>
                    Across all models
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <GroupedBarChart summaries={summaries} models={MODELS} />
      </Box>

      <Box sx={{ mt: 2 }}>
        <ConfidenceStreamGraph summaries={summaries} />
      </Box>

      <Card sx={cardSx}>
        <CardContent>
          <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>
            Top Spam Keywords
          </Typography>
          <SimpleWordCloud words={topWords} />

          <Alert severity="info" sx={{ mt: 3, "& .MuiAlert-message": { width: "100%" } }}>
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
        </CardContent>
      </Card>
    </Stack>
  );
}
