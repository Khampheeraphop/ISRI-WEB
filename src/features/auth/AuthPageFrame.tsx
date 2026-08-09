import { Box, Paper, Stack, Typography } from "@mui/material";
import type { PropsWithChildren } from "react";

export function AuthPageFrame({ children }: PropsWithChildren) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
        py: 4,
        bgcolor: "background.default",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 480,
          border: 1,
          borderColor: "divider",
          p: { xs: 3, sm: 4 },
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography variant="h3" color="primary.main">
              ISRI
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ระบบแจ้งเหตุและแรงจูงใจ
            </Typography>
          </Box>
          {children}
        </Stack>
      </Paper>
    </Box>
  );
}
