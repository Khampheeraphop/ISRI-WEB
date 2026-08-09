import { Chip } from "@mui/material";
import type { IncidentStatus } from "../types/incident";

const statuses: Record<
  IncidentStatus,
  { label: string; color: "default" | "info" | "warning" | "success" }
> = {
  submitted: { label: "รับเรื่องแล้ว", color: "info" },
  pending_assignment: { label: "รอจัดสรรงาน", color: "info" },
  assigned: { label: "มอบหมายงานแล้ว", color: "warning" },
  in_progress: { label: "กำลังดำเนินการ", color: "warning" },
  pending_parts_approval: { label: "รออนุมัติเบิกอะไหล่", color: "warning" },
  waiting_parts: { label: "รออะไหล่", color: "default" },
  pending_repair_approval: { label: "รอตรวจรับงานซ่อม", color: "warning" },
  done: { label: "เสร็จสิ้น", color: "success" },
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
