import { Box, Chip, Paper, Stack, Typography } from "@mui/material";

export function EmptyState({ title, description }) {
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

export function UploadZone({ accept, file, label, helperText, onChange, onClear }) {
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
  );
}
