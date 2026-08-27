import type { WorkOrderStatus } from "../../types/workOrder";
import { workOrderStatusLabels } from "./workOrderWorkflowUi";

export const workOrderStatusDetail: Record<
  WorkOrderStatus,
  { label: string; color: "info" | "warning" | "success" }
> = {
  pending: { label: workOrderStatusLabels.pending, color: "info" },
  in_progress: { label: workOrderStatusLabels.in_progress, color: "warning" },
  pending_parts_approval: {
    label: workOrderStatusLabels.pending_parts_approval,
    color: "warning",
  },
  waiting_parts: { label: workOrderStatusLabels.waiting_parts, color: "warning" },
  pending_repair_approval: {
    label: workOrderStatusLabels.pending_repair_approval,
    color: "warning",
  },
  done: { label: workOrderStatusLabels.done, color: "success" },
};
