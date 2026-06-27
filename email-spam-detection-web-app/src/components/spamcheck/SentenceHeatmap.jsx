import DownloadIcon from "@mui/icons-material/Download";
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Paper,
  Slider,
  Stack,
  Typography,
} from "@mui/material";
import { cardSx, handleExportComponent, percent } from "./constants";

export function SentenceHeatmap({
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
    <Card
      sx={{
        ...cardSx,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
      id="export-sentence-heatmap"
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
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          spacing={2}
          sx={{ pr: { xs: 0, md: 5 } }}
        >
          <Stack direction="row" alignItems="flex-start" spacing={1}>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Sentence Spam Highlighter
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 480 }}>
                Adjust the threshold to filter sentences. Click any highlighted sentence to
                inspect its top spam-triggering words.
              </Typography>
            </Box>
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
        <IconButton
          className="export-btn-hide"
          onClick={() =>
            handleExportComponent("export-sentence-heatmap", "sentence-heatmap.png")
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

        <Paper
          variant="outlined"
          sx={{
            mt: 3,
            p: 3,
            bgcolor: "#f7f9fb",
            borderRadius: 2,
            lineHeight: 2.1,
            flexGrow: 1,
            minHeight: 0,
            maxHeight: 280,
            overflowY: "auto",
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": { background: "rgba(0,0,0,0.1)", borderRadius: "4px" },
            "&::-webkit-scrollbar-thumb:hover": { background: "rgba(0,0,0,0.15)" },
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
                  color:
                    selectedSentence?.text === sentence.text
                      ? "#ba1a1a"
                      : isHighlighted
                        ? "#5f1515"
                        : "text.primary",
                  fontWeight:
                    selectedSentence?.text === sentence.text || isHighlighted ? 500 : "inherit",
                  bgcolor:
                    selectedSentence?.text === sentence.text
                      ? "rgba(186, 26, 26, 0.16)"
                      : isHighlighted
                        ? `rgba(186, 26, 26, ${Math.max(0.08, opacity * 0.14)})`
                        : "transparent",
                  borderBottom:
                    selectedSentence?.text === sentence.text
                      ? "2px solid #ba1a1a"
                      : isHighlighted
                        ? "2px solid rgba(186, 26, 26, 0.25)"
                        : "none",
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
