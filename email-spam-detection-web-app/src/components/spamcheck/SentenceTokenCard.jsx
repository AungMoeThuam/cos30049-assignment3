import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { API_BASE_URL, cardSx, percent, readData } from "./constants";

function WordCloudSvg({ tokens, selectedModel }) {
  const width = 310;
  const height = 240;

  const keywords = tokens
    .map((t) => ({
      word: t.token,
      score: percent(t.models?.[selectedModel]?.spam_probability),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 30);

  const placed = [];
  const intersects = (b1, b2) =>
    b1.x < b2.x + b2.width &&
    b1.x + b1.width > b2.x &&
    b1.y < b2.y + b2.height &&
    b1.y + b1.height > b2.y;

  const getWordColor = (score) => {
    if (score >= 80) return "#b91c1c";
    if (score >= 50) return "#ca8a04";
    return "#64748b";
  };

  keywords.forEach((kw) => {
    const text = kw.word.toUpperCase();
    const fontSize = Math.round(11 + (kw.score / 100) * 21);
    const w = text.length * fontSize * 0.55;
    const h = fontSize;

    let x = width / 2;
    let y = height / 2;
    let theta = Math.random() * Math.PI * 2;
    let radius = 0;
    let found = false;
    let attempts = 0;
    const maxAttempts = 800;

    while (!found && attempts < maxAttempts) {
      attempts++;
      const box = { x: x - w / 2, y: y - h / 2, width: w, height: h };
      const padding = 1.5;
      const paddedBox = {
        x: box.x - padding,
        y: box.y - padding,
        width: box.width + padding * 2,
        height: box.height + padding * 2,
      };

      let overlap =
        placed.some((other) => intersects(paddedBox, other)) ||
        box.x < 4 ||
        box.x + box.width > width - 4 ||
        box.y < 4 ||
        box.y + box.height > height - 4;

      if (!overlap) {
        placed.push({ ...box, word: text, fontSize, score: kw.score });
        found = true;
      } else {
        radius += 0.4;
        theta += 0.12;
        x = width / 2 + Math.cos(theta) * radius;
        y = height / 2 + Math.sin(theta) * radius;
      }
    }

    if (!found) {
      placed.push({
        x: Math.random() * (width - w - 8) + 4,
        y: Math.random() * (height - h - 8) + 4,
        width: w,
        height: h,
        word: text,
        fontSize,
        score: kw.score,
      });
    }
  });

  return (
    <Box
      component="svg"
      viewBox={`0 0 ${width} ${height}`}
      sx={{ width: "100%", height: "100%", overflow: "visible" }}
    >
      {placed.map((item, idx) => (
        <text
          key={`${item.word}-${idx}`}
          x={item.x + item.width / 2}
          y={item.y + item.height - item.fontSize * 0.1}
          textAnchor="middle"
          title={`${item.score}% spam probability`}
          style={{
            fontSize: `${item.fontSize}px`,
            fontWeight: 900,
            fill: getWordColor(item.score),
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
  );
}

export function SentenceTokenCard({ sentence, selectedModel }) {
  const [tokenData, setTokenData] = useState(null);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [viewMode, setViewMode] = useState("cloud");

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
    <Card
      sx={{
        ...cardSx,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
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
          alignItems="center"
          sx={{ mb: 1.5 }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            textTransform="uppercase"
          >
            Top Keywords
          </Typography>
          {sentence && tokenData?.tokens?.length && !isLoadingTokens ? (
            <Stack
              direction="row"
              sx={{
                bgcolor: "#f1f5f9",
                borderRadius: "20px",
                p: "3px",
                display: "flex",
                alignItems: "center",
              }}
            >
              {["list", "cloud"].map((mode) => (
                <Box
                  key={mode}
                  component="button"
                  onClick={() => setViewMode(mode)}
                  sx={{
                    border: 0,
                    bgcolor: viewMode === mode ? "#ffffff" : "transparent",
                    color: viewMode === mode ? "text.primary" : "text.secondary",
                    borderRadius: "16px",
                    px: 1.5,
                    py: 0.5,
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                    textTransform: "uppercase",
                    boxShadow: viewMode === mode ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    transition: "all 0.2s",
                    "&:hover": { color: "text.primary" },
                  }}
                >
                  {mode}
                </Box>
              ))}
            </Stack>
          ) : null}
        </Stack>

        {!sentence ? (
          <Typography variant="body2" color="text.secondary">
            Click a sentence in the heatmap to inspect its top spam-triggering tokens.
          </Typography>
        ) : isLoadingTokens ? (
          <Stack alignItems="center" sx={{ py: 2 }}>
            <CircularProgress size={24} />
          </Stack>
        ) : tokenData?.tokens?.length ? (
          viewMode === "list" ? (
            <Box
              sx={{
                flexGrow: 1,
                minHeight: 0,
                maxHeight: 310,
                overflowY: "auto",
                pr: 0.5,
                "&::-webkit-scrollbar": { width: "6px" },
                "&::-webkit-scrollbar-track": { background: "transparent" },
                "&::-webkit-scrollbar-thumb": { background: "rgba(0,0,0,0.1)", borderRadius: "4px" },
                "&::-webkit-scrollbar-thumb:hover": { background: "rgba(0,0,0,0.15)" },
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
            <Box
              sx={{
                flexGrow: 1,
                minHeight: 0,
                maxHeight: 310,
                overflowY: "auto",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 1.5,
                bgcolor: "#f8fafc",
                borderRadius: 2,
                border: "1px dashed",
                borderColor: "divider",
                "&::-webkit-scrollbar": { width: "6px" },
                "&::-webkit-scrollbar-track": { background: "transparent" },
                "&::-webkit-scrollbar-thumb": { background: "rgba(0,0,0,0.1)", borderRadius: "4px" },
                "&::-webkit-scrollbar-thumb:hover": { background: "rgba(0,0,0,0.15)" },
              }}
            >
              <WordCloudSvg tokens={tokenData.tokens} selectedModel={selectedModel} />
            </Box>
          )
        ) : (
          <Typography variant="body2" color="text.secondary">
            No keyword tokens found for this sentence.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
