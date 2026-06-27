import DownloadIcon from "@mui/icons-material/Download";
import { Box, Card, CardContent, IconButton, Stack, Typography } from "@mui/material";
import * as d3 from "d3";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FEATURE_AXES, cardSx, handleExportComponent } from "./constants";

export function FeatureRadarChart({ features, averages }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const hasEmailFeatures = Boolean(features && Object.keys(features).length);
  const [hiddenSeries, setHiddenSeries] = useState(new Set());

  const toggleSeries = (key) => {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const series = useMemo(
    () => [
      { key: "email", label: "This Email", color: "#000000", values: features },
      { key: "spam", label: "Spam Average", color: "#ba1a1a", values: averages?.spam },
      { key: "ham", label: "Ham Average", color: "#2e7d32", values: averages?.ham },
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
      const scaler =
        averages?.scaler?.[key] ?? DEFAULT_SCALER[key] ?? { mean: 0.0, std: 1.0 };
      const z = (Number(value || 0) - scaler.mean) / (scaler.std || 1.0);
      return Math.max(0, Math.min(1, (z + 2.5) / 5.0));
    },
    [averages],
  );

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

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
      tooltip = d3
        .select(containerRef.current)
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
      .on("mouseover", function (event, axisData) {
        d3.selectAll(".radar-axis-line")
          .attr("stroke", (d) => (d.key === axisData.key ? "#94a3b8" : "#f1f5f9"))
          .attr("stroke-width", (d) => (d.key === axisData.key ? 2 : 1));
        d3.selectAll(".radar-axis-label").attr("fill", (d) =>
          d.key === axisData.key ? "#0f172a" : "#cbd5e1",
        );
      })
      .on("mouseout", function () {
        d3.selectAll(".radar-axis-line").attr("stroke", "#e2e8f0").attr("stroke-width", 1);
        d3.selectAll(".radar-axis-label").attr("fill", "#64748b");
      });

    const visibleSeries = series.filter((item) => item.values && !hiddenSeries.has(item.key));

    svg
      .selectAll(".radar-series")
      .data(visibleSeries, (d) => d.key)
      .join(
        (enter) =>
          enter
            .append("path")
            .attr("class", "radar-series")
            .attr("d", (item) => line(pointsFor(item.values)))
            .attr("fill", (item) => item.color)
            .attr("fill-opacity", 0)
            .attr("stroke", (item) => item.color)
            .attr("stroke-width", 2)
            .style("pointer-events", "none")
            .call((enter) =>
              enter.transition().duration(700).attr("fill-opacity", 0.08),
            ),
        (update) =>
          update.call((update) =>
            update
              .transition()
              .duration(700)
              .attr("d", (item) => line(pointsFor(item.values))),
          ),
        (exit) => exit.transition().duration(300).attr("fill-opacity", 0).remove(),
      );

    visibleSeries.forEach((item) => {
      svg
        .selectAll(`.radar-point-${item.key}`)
        .data(FEATURE_AXES)
        .join(
          (enter) =>
            enter
              .append("circle")
              .attr("class", `radar-point-${item.key}`)
              .attr(
                "cx",
                (axis, index) =>
                  pointFor(index, getNormalized(axis.key, item.values?.[axis.key]))[0],
              )
              .attr(
                "cy",
                (axis, index) =>
                  pointFor(index, getNormalized(axis.key, item.values?.[axis.key]))[1],
              )
              .attr("r", 0)
              .attr("fill", item.color)
              .style("cursor", "crosshair")
              .call((enter) => enter.transition().duration(700).attr("r", 4)),
          (update) =>
            update.call((update) =>
              update
                .transition()
                .duration(700)
                .attr(
                  "cx",
                  (axis, index) =>
                    pointFor(index, getNormalized(axis.key, item.values?.[axis.key]))[0],
                )
                .attr(
                  "cy",
                  (axis, index) =>
                    pointFor(index, getNormalized(axis.key, item.values?.[axis.key]))[1],
                ),
            ),
          (exit) => exit.remove(),
        )
        .on("mouseover", function (event, axis) {
          d3.select(this)
            .transition()
            .duration(150)
            .attr("r", 7)
            .attr("stroke", "#fff")
            .attr("stroke-width", 2);
          const rawVal = item.values?.[axis.key] ?? 0;
          let displayVal = rawVal;
          if (axis.key === "capital_ratio" || axis.key === "emoji_count") {
            displayVal = Number(rawVal).toFixed(3);
          } else if (Number.isFinite(rawVal) && !Number.isInteger(rawVal)) {
            displayVal = Number(rawVal).toFixed(2);
          }
          tooltip
            .html(
              `
            <div style="font-weight: 800; margin-bottom: 4px; color: ${item.color}">${item.label}</div>
            <div>${axis.label}: <strong style="font-size: 13px;">${displayVal}</strong></div>
          `,
            )
            .style("opacity", 1);
        })
        .on("mousemove", function (event) {
          const [x, y] = d3.pointer(event, containerRef.current);
          tooltip.style("left", `${x + 15}px`).style("top", `${y + 15}px`);
        })
        .on("mouseout", function () {
          d3.select(this).transition().duration(150).attr("r", 4).attr("stroke", "none");
          tooltip.style("opacity", 0);
        });
    });
  }, [hasEmailFeatures, getNormalized, series, hiddenSeries]);

  return (
    <Card
      sx={{
        ...cardSx,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
      id="export-radar-chart"
    >
      <CardContent
        sx={{
          p: 2,
          "&:last-child": { pb: 2 },
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ pr: 5 }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Feature Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Compares extracted content signals against training averages.
            </Typography>
          </Box>
        </Stack>
        <IconButton
          className="export-btn-hide"
          onClick={() => handleExportComponent("export-radar-chart", "feature-radar-chart.png")}
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

        <Stack direction="column" spacing={3} alignItems="center" sx={{ mt: 3, width: "100%" }}>
          <Box
            ref={containerRef}
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <Box
              component="svg"
              ref={svgRef}
              role="img"
              aria-label="Feature radar chart"
              sx={{
                width: 260,
                height: 260,
                maxWidth: "100%",
                display: "block",
                overflow: "visible",
              }}
            />
          </Box>
          <Stack direction="row" spacing={3} justifyContent="center" flexWrap="wrap">
            {series.map((item) => {
              const isHidden = hiddenSeries.has(item.key);
              const isEmailSeries = item.key === "email";
              const isDisabled = isEmailSeries && !hasEmailFeatures;
              return (
                <Stack
                  style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}
                  key={item.key}
                  onClick={() => !isDisabled && toggleSeries(item.key)}
                  sx={{
                    cursor: isDisabled ? "default" : "pointer",
                    opacity: isDisabled ? 0.35 : isHidden ? 0.4 : 1,
                    transition: "opacity 0.2s",
                    "&:hover": { opacity: isDisabled ? 0.35 : isHidden ? 0.6 : 0.8 },
                  }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      flexShrink: 0,
                      borderRadius: 0.5,
                      bgcolor: item.color,
                    }}
                  />
                  <Typography
                    style={{ paddingLeft: "0.5rem" }}
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      lineHeight: 1,
                      textDecoration: isHidden ? "line-through" : "none",
                    }}
                  >
                    {item.label}
                  </Typography>
                </Stack>
              );
            })}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
