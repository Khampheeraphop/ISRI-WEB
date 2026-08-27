import { apiFetch } from "../api/apiClient";
import { toIncident, type IncidentDetail } from "../incidents/incidentsApi";
import type { MyWorkOrder } from "../workOrders/workOrdersApi";
import type { UrgencyLevel } from "../../types/incident";

export type DispatchIncident = {
  id: string;
  ticket_number: string;
  location_label: string;
  asset_name: string | null;
  category: string;
  urgency_reported: "critical" | "urgent" | "normal";
  description: string;
  created_at: string;
};
export type DispatchTechnician = {
  id: string;
  full_name: string;
  email: string;
  technician_specialties: string[];
};
export type DispatchSlaRule = {
  urgencyLevel: UrgencyLevel;
  responseMinutes: number;
  resolveMinutes: number;
  pointValue: number;
};

export async function getDispatchIncidents() {
  return (await apiFetch<{ data: DispatchIncident[] }>("/dispatch/incidents"))
    .data;
}
export async function getDispatchIncidentDetail(
  id: string,
): Promise<IncidentDetail> {
  const result = await apiFetch<{
    data: {
      id: string;
      ticket_number: string;
      location_id: string;
      location_label: string;
      asset_name: string | null;
      category: IncidentDetail["category"];
      urgency_reported: IncidentDetail["urgencyReported"];
      description: string;
      status: IncidentDetail["status"];
      created_at: string;
      attachments: IncidentDetail["attachments"];
    };
  }>(`/dispatch/incidents/${id}`);
  return { ...toIncident(result.data), attachments: result.data.attachments };
}
export async function getDispatchTechnicians() {
  return (
    await apiFetch<{ data: DispatchTechnician[] }>("/dispatch/technicians")
  ).data;
}
export async function getDispatchSlaRules(): Promise<DispatchSlaRule[]> {
  const result = await apiFetch<{
    data: Array<{
      urgency_level: UrgencyLevel;
      response_minutes: number;
      resolve_minutes: number;
      point_value: number;
    }>;
  }>("/dispatch/sla-rules");
  return result.data.map((rule) => ({
    urgencyLevel: rule.urgency_level,
    responseMinutes: rule.response_minutes,
    resolveMinutes: rule.resolve_minutes,
    pointValue: rule.point_value,
  }));
}
export async function assignWorkOrder(input: {
  incidentId: string;
  technicianId: string;
  urgencyVerified: "critical" | "urgent" | "normal";
}) {
  return (
    await apiFetch<{ data: { id: string } }>("/dispatch/work-orders", {
      method: "POST",
      body: JSON.stringify(input),
    })
  ).data;
}

export async function getDispatchReviews() {
  return (await apiFetch<{ data: MyWorkOrder[] }>("/dispatch/reviews")).data;
}
