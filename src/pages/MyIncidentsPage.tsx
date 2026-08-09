import {
  ImageOutlined,
  LocationOnOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import { IncidentStatusChip } from "../components/IncidentStatusChip";
import { PriorityRibbon } from "../components/PriorityRibbon";
import { useAuth } from "../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { getMyIncidents } from "../features/incidents/incidentsApi";
import { formatBangkokDate } from "../utils/incident";

export function MyIncidentsPage() {
  const { user } = useAuth();
  const incidents = useQuery({
    queryKey: ["my-incidents"],
    queryFn: getMyIncidents,
  });
  if (!user) return null;
  const items = incidents.data ?? [];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h3">รายการแจ้งซ่อมของฉัน</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            ติดตามสถานะงานและรายละเอียดของแต่ละรายการ
          </Typography>
        </Box>
      </Box>
      {incidents.isLoading ? (
        <Box sx={{ display: "grid", placeItems: "center", minHeight: 280 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={2}>
          {items.map((incident) => (
            <Paper
              key={incident.id}
              sx={{
                position: "relative",
                overflow: "hidden",
                p: { xs: 2.5, md: 3 },
                pr: { xs: 2.5, sm: 13 },
              }}
            >
              <PriorityRibbon urgency={incident.urgencyReported} />
              <Stack spacing={1.5}>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1.2,
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6">{incident.category}</Typography>
                  <IncidentStatusChip status={incident.status} />
                  <Typography variant="body2" color="text.secondary">
                    {incident.ticketNumber}
                  </Typography>
                </Box>
                <Typography>{incident.description}</Typography>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={{ xs: 0.5, sm: 2.5 }}
                  color="text.secondary"
                >
                  <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{ alignItems: "center" }}
                  >
                    <LocationOnOutlined fontSize="small" />
                    <Typography variant="body2">
                      {incident.locationLabel}
                    </Typography>
                  </Stack>
                  <Typography variant="body2">
                    แจ้งเมื่อ {formatBangkokDate(incident.createdAt)} น.
                  </Typography>
                  {incident.photoUrls.length > 0 && (
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{ alignItems: "center" }}
                    >
                      <ImageOutlined fontSize="small" />
                      <Typography variant="body2">
                        แนบภาพ {incident.photoUrls.length} ภาพ
                      </Typography>
                    </Stack>
                  )}
                </Stack>
                <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
                  <Button
                    component={Link}
                    to={"/incidents/" + incident.id}
                    size="small"
                    variant="outlined"
                    startIcon={<VisibilityOutlined />}
                  >
                    ดูรายละเอียด
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ))}
          {!items.length && (
            <Paper sx={{ p: 6, textAlign: "center" }}>
              <Typography variant="h6">ยังไม่มีรายการที่แจ้ง</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                เมื่อแจ้งปัญหาแล้ว รายการจะปรากฏที่นี่
              </Typography>
            </Paper>
          )}
        </Stack>
      )}
    </Box>
  );
}
