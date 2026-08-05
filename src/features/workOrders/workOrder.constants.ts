import type { WorkOrderStatus } from "../../types/workOrder";

export const workOrderStatusDetail: Record<WorkOrderStatus, { label: string; color: "info" | "warning" | "success"; next?: WorkOrderStatus; nextLabel?: string }> = {
  pending: { label: "รอรับเรื่อง", color: "info", next: "in_progress", nextLabel: "รับเรื่อง" },
  in_progress: { label: "กำลังดำเนินการ", color: "warning", next: "waiting_parts", nextLabel: "รออะไหล่" },
  waiting_parts: { label: "รออะไหล่", color: "warning", next: "done", nextLabel: "บันทึกเสร็จสิ้น" },
  done: { label: "เสร็จสิ้น", color: "success" },
};
