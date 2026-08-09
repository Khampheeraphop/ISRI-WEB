import { AssignmentIndOutlined } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { MainCard } from "../../components/base/MainCard";
import {
  assignWorkOrder,
  getDispatchIncidents,
  getDispatchTechnicians,
} from "./dispatchApi";

export function DispatchQueuePage() {
  const client = useQueryClient();
  const incidents = useQuery({
    queryKey: ["dispatch-incidents"],
    queryFn: getDispatchIncidents,
  });
  const technicians = useQuery({
    queryKey: ["dispatch-technicians"],
    queryFn: getDispatchTechnicians,
  });
  const [selected, setSelected] = useState<Record<string, string>>({});
  const assign = useMutation({
    mutationFn: assignWorkOrder,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: ["dispatch-incidents"] }),
  });
  if (incidents.isLoading || technicians.isLoading)
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
          เลือกช่างที่เหมาะสมและมอบหมายงานตามระดับความเร่งด่วน
        </Typography>
      </Box>
      {incidents.error && (
        <Alert severity="error">
          {incidents.error instanceof Error
            ? incidents.error.message
            : "ไม่สามารถโหลดคิวงานได้"}
        </Alert>
      )}
      <MainCard
        title={
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <AssignmentIndOutlined color="primary" />
            <Typography variant="h5">รายการรอจัดสรร</Typography>
          </Stack>
        }
      >
        <Stack spacing={2}>
          {(incidents.data ?? []).map((incident) => (
            <Paper key={incident.id} variant="outlined" sx={{ p: 2.5 }}>
              <Stack spacing={1.5}>
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
                    color={
                      incident.urgency_reported === "critical"
                        ? "error"
                        : incident.urgency_reported === "urgent"
                          ? "warning"
                          : "info"
                    }
                    label={
                      incident.urgency_reported === "critical"
                        ? "วิกฤต"
                        : incident.urgency_reported === "urgent"
                          ? "เร่งด่วน"
                          : "ปกติ"
                    }
                  />
                </Stack>
                <Typography>
                  {incident.category} ·{" "}
                  {incident.asset_name || "ไม่ระบุชิ้นงาน"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {incident.description}
                </Typography>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.25}
                  sx={{ justifyContent: "flex-end" }}
                >
                  <Select
                    size="small"
                    displayEmpty
                    value={selected[incident.id] ?? ""}
                    onChange={(event) =>
                      setSelected((current) => ({
                        ...current,
                        [incident.id]: event.target.value,
                      }))
                    }
                    sx={{ minWidth: 250 }}
                  >
                    <MenuItem value="" disabled>
                      เลือกช่างผู้รับผิดชอบ
                    </MenuItem>
                    {(technicians.data ?? []).map((tech) => (
                      <MenuItem key={tech.id} value={tech.id}>
                        {tech.full_name} —{" "}
                        {tech.technician_specialties.join(", ") ||
                          "ยังไม่ระบุความเชี่ยวชาญ"}
                      </MenuItem>
                    ))}
                  </Select>
                  <Button
                    variant="contained"
                    disabled={!selected[incident.id] || assign.isPending}
                    onClick={() =>
                      assign.mutate({
                        incidentId: incident.id,
                        technicianId: selected[incident.id],
                      })
                    }
                  >
                    มอบหมายงาน
                  </Button>
                </Stack>
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
