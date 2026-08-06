import { AssignmentLateOutlined } from "@mui/icons-material";
import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useAuth } from "../../hooks/useAuth";
import { useEntityQuery } from "../../hooks/useEntity";
import { WorkOrderCard } from "./WorkOrderCard";
import { useWorkOrderActions } from "./useWorkOrderActions";

export function TechnicianWorkOrdersPage() {
  const { user } = useAuth();
  const { workOrders, changeStatus, isUpdating } = useWorkOrderActions();
  const incidents = useEntityQuery("incidents");
  const items = (workOrders.data ?? [])
    .filter((order) => order.technicianId === user.id)
    .map((workOrder) => ({
      workOrder,
      incident: (incidents.data ?? []).find(
        (incident) => incident.id === workOrder.incidentId,
      ),
    }))
    .filter(
      (
        item,
      ): item is {
        workOrder: NonNullable<typeof item.workOrder>;
        incident: NonNullable<typeof item.incident>;
      } => Boolean(item.incident),
    );
  const overdueCount = items.filter(
    ({ workOrder }) => new Date(workOrder.resolveDueAt).getTime() < Date.now(),
  ).length;
  if (workOrders.isLoading || incidents.isLoading)
    return (
      <Box sx={{ minHeight: 320, display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3">งานของฉัน</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          รับงาน อัปเดตสถานะ และติดตามเวลาตาม SLA
        </Typography>
      </Box>
      {overdueCount > 0 && (
        <Alert severity="error" icon={<AssignmentLateOutlined />}>
          มีงานเกิน SLA {overdueCount} รายการ โปรดเร่งดำเนินการ
        </Alert>
      )}
      <Stack spacing={2.5}>
        {items.map(({ workOrder, incident }) => (
          <WorkOrderCard
            key={workOrder.id}
            workOrder={workOrder}
            incident={incident}
            onStatusChange={(status) => changeStatus(workOrder.id, status)}
            isUpdating={isUpdating}
          />
        ))}
        {!items.length && (
          <Alert severity="info">ยังไม่มีงานที่มอบหมายให้คุณ</Alert>
        )}
      </Stack>
    </Stack>
  );
}
