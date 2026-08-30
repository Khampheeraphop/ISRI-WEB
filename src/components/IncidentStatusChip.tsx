import { Chip } from "@mui/material";
import type { IncidentStatus } from "../types/incident";

const statuses: Record<
  IncidentStatus,
  {
    label: string;
    color: "default" | "info" | "warning" | "success" | "error";
  }
> = {
  submitted: { label: "รอตรวจสอบ", color: "info" },
  pending_assignment: { label: "รอตรวจสอบ", color: "info" },
  assigned: { label: "รอช่างรับงาน", color: "warning" },
  in_progress: { label: "กำลังดำเนินการ", color: "warning" },
  pending_parts_approval: { label: "รออนุมัติเบิกอะไหล่", color: "warning" },
  waiting_parts: { label: "รออะไหล่", color: "default" },
  pending_repair_approval: { label: "รอตรวจรับงานซ่อม", color: "warning" },
  done: { label: "ปิดงาน", color: "success" },
  rejected: { label: "ไม่รับรายการ", color: "error" },
};

export function IncidentStatusChip({ status }: { status: IncidentStatus }) {
  const detail = statuses[status];
  return (
    <Chip
      label={detail.label}
      color={detail.color}
      size="small"
      variant="outlined"
    />
  );
}
