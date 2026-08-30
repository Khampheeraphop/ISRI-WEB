import { HistoryOutlined, VisibilityOutlined } from "@mui/icons-material";
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
import { useAuth } from "../../hooks/useAuth";
import { formatBangkokDate } from "../../utils/incident";
import {
  getDispatcherWorkOrderHistory,
  getIncident,
  getMyWorkOrderHistory,
} from "./workOrdersApi";
import { workOrderStatusLabels } from "./workOrderWorkflowUi";

export function WorkOrderHistoryPage() {
  const { user } = useAuth();
  const isDispatcher = user?.role === "dispatcher";
  const history = useQuery({
    queryKey: ["work-order-history", user?.role],
    queryFn: isDispatcher
      ? getDispatcherWorkOrderHistory
      : getMyWorkOrderHistory,
    enabled: user?.role === "dispatcher" || user?.role === "technician",
  });

  if (history.isLoading)
    return (
      <Box sx={{ minHeight: 280, display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3">ประวัติการดำเนินงาน</Typography>
      </Box>
      {history.error && (
        <Alert severity="error">
          {history.error instanceof Error
            ? history.error.message
            : "ไม่สามารถโหลดประวัติการดำเนินงานได้"}
        </Alert>
      )}
      <Stack spacing={2}>
        {(history.data ?? []).map((order) => {
          const incident = getIncident(order);
          if (!incident) return null;
          const detailPath = isDispatcher
            ? `/dispatch/history/${order.id}`
            : `/work-orders/history/${order.id}`;
          return (
            <Paper
              key={order.id}
              variant="outlined"
              sx={{ p: { xs: 2, sm: 2.5 } }}
            >
              <Stack spacing={1.5}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  sx={{ justifyContent: "space-between" }}
                >
                  <Box>
                    <Typography variant="h6">{incident.category}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {incident.ticket_number} · {incident.location_label}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    color="success"
                    label={workOrderStatusLabels[order.status] ?? order.status}
                  />
                </Stack>
                <Typography>{incident.description}</Typography>
                <Typography variant="body2" color="text.secondary">
                  ปิดงานเมื่อ{" "}
                  {formatBangkokDate(
                    order.updated_at ?? order.assigned_at ?? "",
                  )}{" "}
                  น.
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    component={Link}
                    to={detailPath}
                    variant="outlined"
                    startIcon={<VisibilityOutlined />}
                  >
                    ดูรายละเอียด
                  </Button>
                </Box>
              </Stack>
            </Paper>
          );
        })}
        {!history.data?.length && (
          <Paper sx={{ p: 6, textAlign: "center" }}>
            <HistoryOutlined color="disabled" sx={{ fontSize: 34 }} />
            <Typography variant="h6" sx={{ mt: 1 }}>
              ยังไม่มีประวัติการดำเนินงาน
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              งานที่ปิดเสร็จแล้วจะปรากฏในหน้านี้
            </Typography>
          </Paper>
        )}
      </Stack>
    </Stack>
  );
}
