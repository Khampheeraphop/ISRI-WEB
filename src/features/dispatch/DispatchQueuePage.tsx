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
import { getDispatchReviews } from "./dispatchApi";
import { WorkOrderActionDialog } from "../workOrders/WorkOrderActionDialog";
import {
  getIncident,
  performWorkOrderAction,
  type MyWorkOrder,
} from "../workOrders/workOrdersApi";
import {
  actionTitles,
  reviewPrimaryAction,
  workOrderStatusLabels,
} from "../workOrders/workOrderWorkflowUi";

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
  const reviews = useQuery({
    queryKey: ["dispatch-reviews"],
    queryFn: getDispatchReviews,
  });
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [pendingAction, setPendingAction] = useState<{
    order: MyWorkOrder;
    action: string;
  } | null>(null);
  const [actionError, setActionError] = useState<string>();
  const assign = useMutation({
    mutationFn: assignWorkOrder,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: ["dispatch-incidents"] }),
  });
  const reviewAction = useMutation({
    mutationFn: ({
      id,
      action,
      note,
    }: {
      id: string;
      action: string;
      note: string;
    }) => performWorkOrderAction({ id, action, note }),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ["dispatch-reviews"] }),
        client.invalidateQueries({ queryKey: ["dispatch-incidents"] }),
      ]);
      setPendingAction(null);
    },
    onError: (cause) =>
      setActionError(
        cause instanceof Error ? cause.message : "ไม่สามารถบันทึกการอนุมัติได้",
      ),
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
      <MainCard
        title={
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <AssignmentIndOutlined color="primary" />
            <Typography variant="h5">รายการรอพิจารณา</Typography>
          </Stack>
        }
      >
        <Stack spacing={2}>
          {reviews.error && (
            <Alert severity="error">
              {reviews.error instanceof Error
                ? reviews.error.message
                : "ไม่สามารถโหลดรายการรอพิจารณาได้"}
            </Alert>
          )}
          {(reviews.data ?? []).map((order) => (
            <ReviewItem
              key={order.id}
              order={order}
              busy={reviewAction.isPending}
              onAction={(action) => {
                setActionError(undefined);
                setPendingAction({ order, action });
              }}
            />
          ))}
          {!reviews.isLoading && !(reviews.data ?? []).length && (
            <Alert severity="success">ไม่มีรายการที่รอพิจารณา</Alert>
          )}
        </Stack>
      </MainCard>
      <WorkOrderActionDialog
        open={Boolean(pendingAction)}
        action={pendingAction?.action ?? null}
        title={pendingAction ? actionTitles[pendingAction.action] : ""}
        busy={reviewAction.isPending}
        error={actionError}
        onClose={() => setPendingAction(null)}
        onSubmit={(note) =>
          pendingAction &&
          reviewAction.mutate({
            id: pendingAction.order.id,
            action: pendingAction.action,
            note,
          })
        }
      />
    </Stack>
  );
}

function ReviewItem({
  order,
  busy,
  onAction,
}: {
  order: MyWorkOrder;
  busy: boolean;
  onAction: (action: string) => void;
}) {
  const incident = getIncident(order);
  const primary = reviewPrimaryAction[order.status];
  if (!incident || !primary) return null;
  return (
    <Paper variant="outlined" sx={{ p: 2.5 }}>
      <Stack spacing={1.25}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ justifyContent: "space-between" }}
        >
          <Box>
            <Typography variant="h6">{incident.ticket_number}</Typography>
            <Typography color="text.secondary">
              {incident.location_label}
            </Typography>
          </Box>
          <Chip
            size="small"
            color="warning"
            label={workOrderStatusLabels[order.status] ?? order.status}
          />
        </Stack>
        <Typography>
          {incident.category} · {incident.asset_name || "ไม่ได้ระบุชิ้นงาน"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {incident.description}
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ justifyContent: "flex-end" }}
        >
          {order.status === "pending_repair_approval" && (
            <Button
              variant="outlined"
              color="warning"
              onClick={() => onAction("return_for_rework")}
              disabled={busy}
            >
              ส่งกลับให้แก้ไข
            </Button>
          )}
          <Button
            variant="contained"
            onClick={() => onAction(primary.action)}
            disabled={busy}
          >
            {primary.label}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
