import { ConstructionOutlined } from "@mui/icons-material";
import { Box, Paper, Typography } from "@mui/material";

export function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Paper
      sx={{
        p: { xs: 3, md: 5 },
        minHeight: 360,
        display: "grid",
        placeItems: "center",
        textAlign: "center",
      }}
    >
      <Box>
        <ConstructionOutlined color="primary" sx={{ fontSize: 42, mb: 1 }} />
        <Typography variant="h4">{title}</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {description}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
          หน้านี้ถูกเตรียม routing และสิทธิ์การเข้าถึงไว้แล้ว
        </Typography>
      </Box>
    </Paper>
  );
}
