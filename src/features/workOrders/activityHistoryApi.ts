import { apiFetch } from "../api/apiClient";
import type { WorkOrderEvent } from "./workOrdersApi";

export type ActivityEvent = Omit<WorkOrderEvent, "attachments"> & {
  previous_status?: string | null;
};
export type ActivityRecord = {
  id: string;
  ticketNumber: string;
  locationLabel: string;
  assetName: string | null;
  category: string;
  description: string;
  status: string;
  createdAt: string;
  workOrderId: string | null;
  latestEvent: ActivityEvent;
  myLatestEvent: ActivityEvent | null;
};
export type ActivityDetail = {
  incident: ActivityRecord;
  events: WorkOrderEvent[];
  workOrder: {
    technician_name: string | null;
    support_technician_names: string[];
  } | null;
};
export async function getActivityHistory() {
  return (await apiFetch<{ data: ActivityRecord[] }>("/activity-history")).data;
}
export async function getActivityDetail(id: string) {
  return (await apiFetch<{ data: ActivityDetail }>(`/activity-history/${id}`))
    .data;
}
export const historyStatusLabels: Record<string, string> = {
  submitted: "รับแจ้งรายการ",
  pending_assignment: "รอจัดสรรงาน",
  assigned: "รอช่างรับงาน",
  pending: "รอช่างรับงาน",
  in_progress: "กำลังดำเนินการ",
  pending_parts_approval: "รออนุมัติเบิกอะไหล่",
  waiting_parts: "รอรับอะไหล่",
  pending_repair_approval: "รอตรวจรับงานซ่อม",
  done: "ปิดงาน",
  rejected: "ไม่รับรายการ",
};
export function historyStatusColor(status: string) {
  if (status === "done") return "success";
  if (status === "rejected") return "error";
  if (
    [
      "pending_parts_approval",
      "waiting_parts",
      "pending_repair_approval",
    ].includes(status)
  )
    return "warning";
  if (status === "in_progress") return "primary";
  return "default";
}
export function activityEventLabel(event: {
  status: string;
  event_type: string;
  previous_status?: string | null;
}) {
  if (event.event_type === "incident_created") return "แจ้งซ่อม";
  if (event.event_type === "incident_rejected") return "ไม่รับรายการแจ้งซ่อม";
  if (event.status === "pending") return "มอบหมายงานให้ช่าง";
  if (event.status === "done") return "ตรวจรับและปิดงาน";
  if (event.status === "pending_repair_approval")
    return "ส่งผลการซ่อมเพื่อตรวจรับ";
  if (event.status === "pending_parts_approval") return "ขออนุมัติเบิกอะไหล่";
  if (event.status === "waiting_parts") return "อนุมัติเบิกอะไหล่";
  if (event.status === "in_progress") {
    if (event.previous_status === "pending_repair_approval")
      return "ส่งกลับให้แก้ไขงานซ่อม";
    if (event.previous_status === "pending_parts_approval")
      return "ไม่อนุมัติคำขออะไหล่";
    if (event.previous_status === "waiting_parts")
      return "ยืนยันรับอะไหล่และดำเนินการต่อ";
    if (event.previous_status === "pending") return "รับงานและเริ่มดำเนินการ";
    return "บันทึกการดำเนินงานซ่อม";
  }
  return historyStatusLabels[event.status] ?? "อัปเดตการดำเนินงาน";
}
