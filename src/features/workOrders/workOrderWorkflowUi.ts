import {
  BuildOutlined,
  CheckCircleOutlined,
  Inventory2Outlined,
  TaskAltOutlined,
} from "@mui/icons-material";

export type WorkOrderActionName =
  | "accept_work"
  | "request_parts"
  | "approve_parts"
  | "reject_parts"
  | "confirm_parts_received"
  | "submit_repair"
  | "approve_repair"
  | "return_for_rework";

type WorkflowActionButton = {
  action: WorkOrderActionName;
  label: string;
  icon?: typeof BuildOutlined;
};

export const workOrderStatusLabels: Record<string, string> = {
  pending: "รอรับงาน",
  in_progress: "กำลังดำเนินการ",
  pending_parts_approval: "รออนุมัติเบิกอะไหล่",
  waiting_parts: "รอรับอะไหล่",
  pending_repair_approval: "รอตรวจรับงานซ่อม",
  done: "ปิดงาน",
};

export const technicianPrimaryAction: Record<
  string,
  WorkflowActionButton | undefined
> = {
  pending: { action: "accept_work", label: "รับงาน", icon: TaskAltOutlined },
  in_progress: {
    action: "submit_repair",
    label: "ส่งผลการซ่อม",
    icon: CheckCircleOutlined,
  },
  waiting_parts: {
    action: "confirm_parts_received",
    label: "ยืนยันรับอะไหล่",
    icon: Inventory2Outlined,
  },
};

export const reviewPrimaryAction: Record<
  string,
  WorkflowActionButton | undefined
> = {
  pending_parts_approval: {
    action: "approve_parts",
    label: "อนุมัติเบิกอะไหล่",
    icon: Inventory2Outlined,
  },
  pending_repair_approval: {
    action: "approve_repair",
    label: "อนุมัติผลการซ่อม",
    icon: CheckCircleOutlined,
  },
};

export const reviewSecondaryAction: Record<
  string,
  WorkflowActionButton | undefined
> = {
  pending_parts_approval: { action: "reject_parts", label: "ไม่อนุมัติ" },
  pending_repair_approval: {
    action: "return_for_rework",
    label: "ส่งกลับให้แก้ไข",
  },
};

export const actionNeedsNote = new Set([
  "request_parts",
  "submit_repair",
  "reject_parts",
  "return_for_rework",
]);

export const actionTitles: Record<string, string> = {
  accept_work: "รับงาน",
  request_parts: "เบิกอะไหล่",
  approve_parts: "อนุมัติเบิกอะไหล่",
  reject_parts: "ไม่อนุมัติคำขออะไหล่",
  confirm_parts_received: "ยืนยันรับอะไหล่",
  submit_repair: "ส่งผลการซ่อม",
  approve_repair: "อนุมัติผลการซ่อม",
  return_for_rework: "ส่งกลับให้แก้ไข",
};
