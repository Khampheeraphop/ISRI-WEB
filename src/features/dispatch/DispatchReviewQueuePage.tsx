import { FactCheckOutlined, VisibilityOutlined } from "@mui/icons-material";
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
import { MainCard } from "../../components/base/MainCard";
import { WorkOrderActionDialog } from "../workOrders/WorkOrderActionDialog";
import {
  getIncident,
  performWorkOrderAction,
  type MyWorkOrder,
} from "../workOrders/workOrdersApi";
import {
  actionTitles,
  reviewPrimaryAction,
  reviewSecondaryAction,
  workOrderStatusLabels,
} from "../workOrders/workOrderWorkflowUi";
import { getDispatchReviews } from "./dispatchApi";

export function DispatchReviewQueuePage() {
  const client = useQueryClient();
  const reviews = useQuery({
    queryKey: ["dispatch-reviews"],
    queryFn: getDispatchReviews,
  });
  const [pendingAction, setPendingAction] = useState<{
    order: MyWorkOrder;
    action: string;
  } | null>(null);
  const [actionError, setActionError] = useState<string>();
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
        client.invalidateQueries({
          queryKey: ["work-order-history", "dispatcher"],
        }),
      ]);
      setPendingAction(null);
    },
    onError: (cause) =>
      setActionError(
        cause instanceof Error ? cause.message : "ไม่สามารถบันทึกการพิจารณาได้",
      ),
  });

  if (reviews.isLoading)
    return (
      <Box sx={{ minHeight: 280, display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3">รายการรอพิจารณา</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          พิจารณาคำขอเบิกอะไหล่และตรวจรับผลการซ่อมจากช่างผู้รับผิดชอบ
        </Typography>
      </Box>
      {reviews.error && (
        <Alert severity="error">
          {reviews.error instanceof Error
            ? reviews.error.message
            : "ไม่สามารถโหลดรายการรอพิจารณาได้"}
        </Alert>
      )}
      <MainCard
        title={
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <FactCheckOutlined color="primary" />
            <Typography variant="h5">งานรอพิจารณา</Typography>
          </Stack>
        }
      >
        <Stack spacing={2}>
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
          {!reviews.data?.length && (
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
  const secondary = reviewSecondaryAction[order.status];
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
          <Button
            component={Link}
            to={`/work-orders/${order.id}`}
            variant="outlined"
            startIcon={<VisibilityOutlined />}
          >
            ดูรายละเอียด
          </Button>
          {secondary && (
            <Button
              variant="outlined"
              color="warning"
              onClick={() => onAction(secondary.action)}
              disabled={busy}
            >
              {secondary.label}
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
