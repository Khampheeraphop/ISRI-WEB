import { Box } from "@mui/material";
import type { UrgencyLevel } from "../types/incident";
import { urgencyPresentation } from "../utils/incident";

export function PriorityRibbon({ urgency }: { urgency: UrgencyLevel }) {
  const detail = urgencyPresentation[urgency];
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
        bgcolor: detail.hex,
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
