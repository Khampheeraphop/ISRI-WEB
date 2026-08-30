import { AssignmentIndOutlined, VisibilityOutlined } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { MainCard } from "../../components/base/MainCard";
import { getDispatchIncidents } from "./dispatchApi";

export function DispatchQueuePage() {
  const incidents = useQuery({
    queryKey: ["dispatch-incidents"],
    queryFn: getDispatchIncidents,
  });

  if (incidents.isLoading)
    return (
      <Box sx={{ minHeight: 280, display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3">คิวรอจัดสรรงาน</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          ตรวจสอบรายละเอียดคำขอก่อนเลือกช่างผู้รับผิดชอบและมอบหมายงาน
        </Typography>
      </Box>
      {incidents.error && (
        <Alert severity="error">
          {incidents.error instanceof Error
            ? incidents.error.message
            : "ไม่สามารถโหลดคิวงานได้"}
        </Alert>
      )}
      <MainCard title={<CardTitle label="รายการรอจัดสรร" />}>
        <Stack spacing={2}>
          {(incidents.data ?? []).map((incident) => (
            <Paper key={incident.id} variant="outlined" sx={{ p: 2.5 }}>
              <Stack spacing={1.25}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  sx={{ justifyContent: "space-between" }}
                >
                  <Box>
                    <Typography variant="h6">
                      {incident.ticket_number}
                    </Typography>
                    <Typography color="text.secondary">
                      {incident.location_label}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    color="default"
                    label="รอผู้จัดสรรประเมิน SLA"
                  />
                </Stack>
                <Typography>
                  {incident.category} ·{" "}
                  {incident.asset_name || "ไม่ได้ระบุชิ้นงาน"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {incident.description}
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    component={Link}
                    to={`/dispatch/incidents/${incident.id}`}
                    variant="outlined"
                    startIcon={<VisibilityOutlined />}
                  >
                    ดูรายละเอียดและมอบหมาย
                  </Button>
                </Box>
              </Stack>
            </Paper>
          ))}
          {!(incidents.data ?? []).length && (
            <Alert severity="success">ไม่มีรายการที่รอจัดสรรงาน</Alert>
          )}
        </Stack>
      </MainCard>
    </Stack>
  );
}

function CardTitle({ label }: { label: string }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
      <AssignmentIndOutlined color="primary" />
      <Typography variant="h5">{label}</Typography>
    </Stack>
  );
}
