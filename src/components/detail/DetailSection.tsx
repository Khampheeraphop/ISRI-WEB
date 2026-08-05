import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { MainCard } from "../base/MainCard";

export type DetailField = {
  label: string;
  value: ReactNode;
  fullWidth?: boolean;
};

export function DetailSection({
  title,
  icon,
  fields,
  children,
}: {
  title: string;
  icon: ReactNode;
  fields?: DetailField[];
  children?: ReactNode;
}) {
  return (
    <MainCard
      title={
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Box color="primary.main">{icon}</Box>
          <Typography variant="h5">{title}</Typography>
        </Stack>
      }
      contentSx={{ p: { xs: 2.5, md: 3 } }}
    >
      {fields && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
            gap: 2.5,
          }}
        >
          {fields.map((field) => (
            <Box
              key={field.label}
              sx={{ gridColumn: field.fullWidth ? "1 / -1" : "auto" }}
            >
              <Typography variant="body2" color="text.secondary">
                {field.label}
              </Typography>
              <Box sx={{ mt: 0.45 }}>{field.value}</Box>
            </Box>
          ))}
        </Box>
      )}
      {children}
    </MainCard>
  );
}
