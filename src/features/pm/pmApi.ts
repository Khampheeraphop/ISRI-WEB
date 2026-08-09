import { apiFetch } from "../api/apiClient";
import type { PMLog, PMSchedule } from "../../types/pm";

type ScheduleResponse = {
  id: string;
  location_id: string;
  location_label: string;
  asset_name: string;
  interval_months: number;
  last_done_at: string;
  next_due_at: string;
};

type LogResponse = {
  id: string;
  schedule_id: string;
  completed_at: string;
  technician_id: string;
  notes: string;
};

export type PMScheduleInput = {
  locationId: string;
  assetName: string;
  intervalMonths: number;
  lastDoneAt: string;
};

const toSchedule = (item: ScheduleResponse): PMSchedule => ({
  id: item.id,
  locationId: item.location_id,
  locationLabel: item.location_label,
  assetName: item.asset_name,
  intervalMonths: item.interval_months,
  lastDoneAt: item.last_done_at,
  nextDueAt: item.next_due_at,
});

const toLog = (item: LogResponse): PMLog => ({
  id: item.id,
  scheduleId: item.schedule_id,
  completedAt: item.completed_at,
  technicianId: item.technician_id,
  notes: item.notes,
});

export async function getPMSchedules() {
  const result = await apiFetch<{ data: ScheduleResponse[] }>("/pm/schedules");
  return result.data.map(toSchedule);
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
  return toSchedule(result.data);
}

export async function updatePMSchedule(input: PMScheduleInput & { id: string }) {
  const result = await apiFetch<{ data: ScheduleResponse }>(
    `/pm/schedules/${input.id}`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
  return toSchedule(result.data);
}

export async function completePMSchedule(input: { id: string; notes: string }) {
  const result = await apiFetch<{
    data: { schedule: ScheduleResponse; log: LogResponse };
  }>(`/pm/schedules/${input.id}/complete`, {
    method: "POST",
    body: JSON.stringify({ notes: input.notes }),
  });
  return { schedule: toSchedule(result.data.schedule), log: toLog(result.data.log) };
}
