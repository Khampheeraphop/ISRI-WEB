import { apiFetch } from "../api/apiClient";

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

export async function getDispatchIncidents() {
  return (await apiFetch<{ data: DispatchIncident[] }>("/dispatch/incidents"))
    .data;
}
export async function getDispatchTechnicians() {
  return (
    await apiFetch<{ data: DispatchTechnician[] }>("/dispatch/technicians")
  ).data;
}
export async function assignWorkOrder(input: {
  incidentId: string;
  technicianId: string;
}) {
  return (
    await apiFetch<{ data: { id: string } }>("/dispatch/work-orders", {
      method: "POST",
      body: JSON.stringify(input),
    })
  ).data;
}
