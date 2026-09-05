import { apiFetch } from "../api/apiClient";

export type AppNotification = {
  id: string;
  type: string;
  message: string;
  related_incident_id: string | null;
  work_order_id?: string | null;
  related_pm_schedule_id?: string | null;
  target_path?: string | null;
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

export async function markAllNotificationsRead() {
  return (
    await apiFetch<{ data: { success: true } }>("/notifications/read-all", {
      method: "PATCH",
    })
  ).data;
}
