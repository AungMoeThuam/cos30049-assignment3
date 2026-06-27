import DownloadIcon from "@mui/icons-material/Download";
import {
  Box,
  Card,
  CardContent,
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import {
  MODELS,
  cardSx,
  getConfidence,
  getModelPrediction,
  handleExportComponent,
  percent,
  verdictColor,
} from "./constants";

export function ModelComparison({ result, selectedModel, onSelectedModelChange }) {
  const predictions = MODELS.map((model) => ({
    ...model,
    prediction: getModelPrediction(result, model.key),
  }));

  return (
    <Card
      sx={{
        ...cardSx,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
      id="export-model-comparison"
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
            <Typography variant="caption" color="text.secondary" display="block">
              Model Comparison & Distribution
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Compare spam and safe probabilities across all classifiers.
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
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
              onClick={() =>
                handleExportComponent("export-model-comparison", "model-comparison.png")
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
          {/* Model cards grid */}
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
                  borderColor: selectedModel === key ? "text.primary" : "divider",
                }}
              >
                <Typography variant="caption" color="text.secondary" textTransform="uppercase">
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
                    <Box component="span" sx={{ fontSize: 11, textTransform: "uppercase" }}>
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

          {/* Bar chart */}
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
                        "&:hover": { bgcolor: "action.hover" },
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
