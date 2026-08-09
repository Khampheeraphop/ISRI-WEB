import { apiFetch } from "../api/apiClient";

export type AppNotification = {
  id: string;
  type: string;
  message: string;
  related_incident_id: string | null;
  is_read: boolean;
  created_at: string;
};
export async function getNotifications() {
  return (await apiFetch<{ data: AppNotification[] }>("/notifications")).data;
}
export async function markNotificationRead(id: string) {
  return (
    await apiFetch<{ data: { id: string } }>(`/notifications/${id}/read`, {
      method: "PATCH",
    })
  ).data;
}
