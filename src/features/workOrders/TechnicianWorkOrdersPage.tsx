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
import { getIncident, getMyWorkOrders } from "./workOrdersApi";
import { workOrderStatusLabels } from "./workOrderWorkflowUi";

export function TechnicianWorkOrdersPage() {
  const orders = useQuery({
    queryKey: ["my-work-orders"],
    queryFn: getMyWorkOrders,
  });
  if (orders.isLoading)
    return (
      <Box sx={{ minHeight: 280, display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3">งานของฉัน</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          เลือกรายการเพื่อดูรายละเอียดและดำเนินงานตามขั้นตอน
        </Typography>
      </Box>
      {orders.error && (
        <Alert severity="error">
          {orders.error instanceof Error
            ? orders.error.message
            : "ไม่สามารถโหลดงานได้"}
        </Alert>
      )}
      <Stack spacing={2}>
        {(orders.data ?? []).map((order) => (
          <WorkOrderItem key={order.id} order={order} />
        ))}
        {!(orders.data ?? []).length && (
          <Alert severity="info">ยังไม่มีงานที่ได้รับมอบหมาย</Alert>
        )}
      </Stack>
    </Stack>
  );
}

function WorkOrderItem({
  order,
}: {
  order: Awaited<ReturnType<typeof getMyWorkOrders>>[number];
}) {
  const incident = getIncident(order);
  const overdue =
    new Date(order.resolve_due_at).getTime() < Date.now() &&
    order.status !== "done";
  if (!incident) return null;
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 } }}>
      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
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
            color={overdue ? "error" : "info"}
            label={
              overdue
                ? "เกิน SLA"
                : (workOrderStatusLabels[order.status] ?? order.status)
            }
          />
        </Stack>
        {order.assignment_role === "support" && (
          <Typography variant="body2" color="text.secondary">
            บทบาทของคุณ: ช่างสนับสนุน
          </Typography>
        )}
        <Typography>{incident.description}</Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ justifyContent: "flex-end" }}
        >
          <Button
            component={Link}
            to={`/work-orders/${order.id}`}
            variant="contained"
          >
            ดูรายละเอียด
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
