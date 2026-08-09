import { Inventory2Outlined } from "@mui/icons-material";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { WorkOrderActionDialog } from "./WorkOrderActionDialog";
import {
  getIncident,
  getMyWorkOrders,
  performWorkOrderAction,
  uploadWorkOrderAttachments,
  type MyWorkOrder,
} from "./workOrdersApi";
import {
  actionTitles,
  technicianPrimaryAction,
  workOrderStatusLabels,
} from "./workOrderWorkflowUi";

type PendingAction = { order: MyWorkOrder; action: string } | null;

export function TechnicianWorkOrdersPage() {
  const client = useQueryClient();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [actionError, setActionError] = useState<string>();
  const orders = useQuery({
    queryKey: ["my-work-orders"],
    queryFn: getMyWorkOrders,
  });
  const action = useMutation({
    mutationFn: async (input: {
      id: string;
      action: string;
      note: string;
      files: File[];
    }) =>
      performWorkOrderAction({
        id: input.id,
        action: input.action,
        note: input.note,
        attachments: await uploadWorkOrderAttachments(input.files),
      }),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ["my-work-orders"] }),
        client.invalidateQueries({ queryKey: ["work-order"] }),
      ]);
      setPendingAction(null);
    },
    onError: (cause) =>
      setActionError(
        cause instanceof Error
          ? cause.message
          : "ไม่สามารถบันทึกการดำเนินงานได้",
      ),
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
          ดำเนินงานผ่านปุ่มตามขั้นตอน ระบบจะบันทึกสถานะและประวัติให้อัตโนมัติ
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
          <WorkOrderItem
            key={order.id}
            order={order}
            isPending={action.isPending}
            onAction={(actionName) => {
              setActionError(undefined);
              setPendingAction({ order, action: actionName });
            }}
          />
        ))}
        {!(orders.data ?? []).length && (
          <Alert severity="info">ยังไม่มีงานที่ได้รับมอบหมาย</Alert>
        )}
      </Stack>
      <WorkOrderActionDialog
        open={Boolean(pendingAction)}
        action={pendingAction?.action ?? null}
        title={pendingAction ? actionTitles[pendingAction.action] : ""}
        busy={action.isPending}
        error={actionError}
        onClose={() => setPendingAction(null)}
        onSubmit={(note, files) =>
          pendingAction &&
          action.mutate({
            id: pendingAction.order.id,
            action: pendingAction.action,
            note,
            files,
          })
        }
      />
    </Stack>
  );
}

function WorkOrderItem({
  order,
  isPending,
  onAction,
}: {
  order: MyWorkOrder;
  isPending: boolean;
  onAction: (action: string) => void;
}) {
  const incident = getIncident(order);
  const primary = technicianPrimaryAction[order.status];
  const PrimaryIcon = primary?.icon;
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
        <Typography>{incident.description}</Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ justifyContent: "flex-end" }}
        >
          <Button
            component={Link}
            to={`/work-orders/${order.id}`}
            variant="outlined"
          >
            ดูรายละเอียด
          </Button>
          {order.status === "in_progress" && (
            <Button
              variant="outlined"
              startIcon={<Inventory2Outlined />}
              onClick={() => onAction("request_parts")}
              disabled={isPending}
            >
              เบิกอะไหล่
            </Button>
          )}
          {primary && (
            <Button
              variant="contained"
              startIcon={PrimaryIcon ? <PrimaryIcon /> : undefined}
              onClick={() => onAction(primary.action)}
              disabled={isPending}
            >
              {primary.label}
            </Button>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}
