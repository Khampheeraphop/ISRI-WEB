import { ImageOutlined } from "@mui/icons-material";
import { Box, Chip, Stack, Typography } from "@mui/material";
import type { WorkOrderEvent } from "./workOrdersApi";
import { workOrderStatusLabels } from "./workOrderWorkflowUi";
import { formatBangkokDate } from "../../utils/incident";

export function WorkOrderHistoryTimeline({
  events,
}: {
  events: WorkOrderEvent[];
}) {
  if (!events.length)
    return (
      <Typography color="text.secondary">
        ยังไม่มีประวัติการดำเนินงาน
      </Typography>
    );
  return (
    <Stack spacing={0}>
      {events.map((event, index) => (
        <Stack
          key={event.id}
          direction="row"
          spacing={1.75}
          sx={{ minHeight: 108 }}
        >
          <Stack sx={{ alignItems: "center", width: 30, flex: "0 0 30px" }}>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                bgcolor: "primary.main",
                color: "primary.contrastText",
                display: "grid",
                placeItems: "center",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {index + 1}
            </Box>
            {index < events.length - 1 && (
              <Box sx={{ width: 2, flex: 1, bgcolor: "divider", my: 0.75 }} />
            )}
          </Stack>
          <Box sx={{ pb: 2.5, minWidth: 0, flex: 1 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={0.75}
              sx={{
                justifyContent: "space-between",
                alignItems: { sm: "center" },
              }}
            >
              <Chip
                size="small"
                color={
                  event.status === "done"
                    ? "success"
                    : event.status === "rejected"
                      ? "error"
                      : "primary"
                }
                label={workOrderStatusLabels[event.status] ?? event.status}
              />
              <Typography variant="body2" color="text.secondary">
                {formatBangkokDate(event.changed_at)} น.
              </Typography>
            </Stack>
            <Typography sx={{ fontWeight: 700, mt: 0.75 }}>
              {event.changed_by_name}
            </Typography>
            {event.note && (
              <Typography sx={{ whiteSpace: "pre-wrap", mt: 0.5 }}>
                {event.note}
              </Typography>
            )}
            {event.attachments.length > 0 && (
              <Stack
                direction="row"
                spacing={1}
                sx={{ mt: 1.25, flexWrap: "wrap", rowGap: 1 }}
              >
                {event.attachments.map((file) => (
                  <Box
                    key={file.url}
                    component="a"
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    sx={{
                      width: 100,
                      height: 72,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1.5,
                      overflow: "hidden",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {file.mimeType.startsWith("image/") ? (
                      <Box
                        component="img"
                        src={file.url}
                        alt={file.fileName}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <ImageOutlined />
                    )}
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}
