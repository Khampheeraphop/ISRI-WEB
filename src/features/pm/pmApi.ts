import { apiFetch } from "../api/apiClient";
import type { PMLog, PMSchedule } from "../../types/pm";

type ScheduleResponse = {
  id: string;
  location_id: string;
  location_label: string;
  asset_name: string;
  plan_details: string;
  interval_months: number;
  last_done_at: string | null;
  next_due_at: string;
  end_at: string | null;
  status: PMSchedule["status"];
  calendar_sequence: number;
  assigned_technician_id?: string | null;
  profiles?: { full_name: string; email?: string } | null;
};

type LogResponse = {
  id: string;
  schedule_id: string;
  completed_at: string;
  created_at: string | null;
  technician_id: string;
  profiles: { full_name: string } | null;
  notes: string;
};

export type PMScheduleInput = {
  locationId: string;
  assetName: string;
  planDetails: string;
  intervalMonths: number;
  lastDoneAt: string | null;
  nextDueAt: string;
  endAt: string | null;
  status: PMSchedule["status"];
  assignedTechnicianId?: string | null;
};

export type PMTechnicianOption = {
  id: string;
  full_name: string;
  email: string;
  technician_specialties: string[];
};

const toSchedule = (item: ScheduleResponse): PMSchedule => ({
  id: item.id,
  locationId: item.location_id,
  locationLabel: item.location_label,
  assetName: item.asset_name,
  planDetails: item.plan_details,
  intervalMonths: item.interval_months,
  lastDoneAt: item.last_done_at,
  nextDueAt: item.next_due_at,
  endAt: item.end_at,
  status: item.status,
  calendarSequence: item.calendar_sequence,
  assignedTechnicianId: item.assigned_technician_id ?? null,
  assignedTechnicianName: item.profiles?.full_name ?? null,
  assignedTechnicianEmail: item.profiles?.email ?? null,
});

function assertPmLifecycleSaved(
  item: ScheduleResponse,
  input: PMScheduleInput,
) {
  if (
    !("end_at" in item) ||
    !("status" in item) ||
    !("calendar_sequence" in item)
  ) {
    throw new Error(
      "Backend ยังไม่ได้อัปเดต PM lifecycle กรุณา deploy migration และ isri-api เวอร์ชันล่าสุด",
    );
  }
  const requestedEnd = input.endAt ? new Date(input.endAt).getTime() : null;
  const savedEnd = item.end_at ? new Date(item.end_at).getTime() : null;
  if (requestedEnd !== savedEnd || item.status !== input.status) {
    throw new Error("ระบบบันทึกวันสิ้นสุดหรือสถานะแผน PM ไม่สำเร็จ");
  }
}

const toLog = (item: LogResponse): PMLog => ({
  id: item.id,
  scheduleId: item.schedule_id,
  completedAt: item.completed_at,
  createdAt: item.created_at ?? null,
  technicianId: item.technician_id,
  technicianName: item.profiles?.full_name ?? null,
  notes: item.notes,
});

export async function getPMSchedules() {
  const result = await apiFetch<{ data: ScheduleResponse[] }>("/pm/schedules");
  return result.data.map(toSchedule);
}

export async function getPMTechnicians(): Promise<PMTechnicianOption[]> {
  try {
    const result = await apiFetch<{ data: PMTechnicianOption[] }>(
      "/pm/technicians",
    );
    if (result.data?.length) return result.data;
  } catch {
    // Fallback to /admin/users if /pm/technicians is not yet deployed to cloud edge functions
  }

  const usersResult = await apiFetch<{
    data: Array<{
      id: string;
      full_name: string;
      email: string;
      approval_status: string;
      role: string | null;
      technician_specialties: string[];
    }>;
  }>("/admin/users");

  return (usersResult.data ?? [])
    .filter((u) => u.approval_status === "approved" && u.role === "technician")
    .map((u) => ({
      id: u.id,
      full_name: u.full_name,
      email: u.email,
      technician_specialties: u.technician_specialties ?? [],
    }));
}

export async function getPMSchedule(id: string) {
  const result = await apiFetch<{
    data: { schedule: ScheduleResponse; logs: LogResponse[] };
  }>(`/pm/schedules/${id}`);
  return {
    schedule: toSchedule(result.data.schedule),
    logs: result.data.logs.map(toLog),
  };
}

export async function createPMSchedule(input: PMScheduleInput) {
  const result = await apiFetch<{ data: ScheduleResponse }>("/pm/schedules", {
    method: "POST",
    body: JSON.stringify(input),
  });
  assertPmLifecycleSaved(result.data, input);
  return toSchedule(result.data);
}

export async function updatePMSchedule(
  input: PMScheduleInput & { id: string },
) {
  const result = await apiFetch<{ data: ScheduleResponse }>(
    `/pm/schedules/${input.id}`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
  assertPmLifecycleSaved(result.data, input);
  return toSchedule(result.data);
}

export async function completePMSchedule(input: {
  id: string;
  completedAt: string;
  notes: string;
}) {
  const result = await apiFetch<{
    data: { schedule: ScheduleResponse; log: LogResponse };
  }>(`/pm/schedules/${input.id}/complete`, {
    method: "POST",
    body: JSON.stringify({
      completedAt: input.completedAt,
      notes: input.notes,
    }),
  });
  return {
    schedule: toSchedule(result.data.schedule),
    log: toLog(result.data.log),
  };
}
