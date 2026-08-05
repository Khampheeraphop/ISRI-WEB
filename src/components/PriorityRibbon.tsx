import { Box } from "@mui/material";
import type { UrgencyLevel } from "../types/incident";

const priority = {
  critical: { label: "วิกฤต", color: "#C1443A" },
  urgent: { label: "เร่งด่วน", color: "#C68A2E" },
  normal: { label: "ปกติ", color: "#3E6FA6" },
} as const;

export function PriorityRibbon({ urgency }: { urgency: UrgencyLevel }) {
  const detail = priority[urgency];
  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        right: 0,
        minWidth: 84,
        px: 1.5,
        py: 0.55,
        color: "common.white",
        bgcolor: detail.color,
        fontSize: "0.8rem",
        fontWeight: 600,
        textAlign: "center",
        clipPath: "polygon(12% 0, 100% 0, 100% 100%, 0 100%, 12% 50%)",
      }}
    >
      {detail.label}
    </Box>
  );
}
