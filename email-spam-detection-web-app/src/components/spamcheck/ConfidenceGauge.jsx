import { Box, Card, CardContent, Chip, CircularProgress, Stack, Typography } from "@mui/material";
import { cardSx, getConfidence, percent } from "./constants";

export function ConfidenceGauge({ value, label }) {
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

export function OverallAssessment({ prediction }) {
  if (!prediction) {
    return (
      <Card sx={cardSx}>
        <CardContent sx={{ p: 2, textAlign: "center", "&:last-child": { pb: 2 } }}>
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
            <Typography variant="caption" color="text.secondary" display="block">
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
      <CardContent sx={{ p: 2, textAlign: "center", "&:last-child": { pb: 2 } }}>
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
          <ConfidenceGauge value={getConfidence(prediction)} label={prediction.label} />
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
