import { supabase } from "../../lib/supabase/client";
import { apiFetch } from "../api/apiClient";

export type WorkOrderIncident = {
  ticket_number: string;
  location_label: string;
  asset_name: string | null;
  category: string;
  urgency_reported: "critical" | "urgent" | "normal";
  description: string;
  status: string;
};

export type WorkOrderAttachment = {
  objectPath: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
};

export type WorkOrderEvent = {
  id: string;
  status: string;
  changed_at: string;
  changed_by: string | null;
  changed_by_name: string;
  note: string | null;
  event_type: string;
  previous_status?: string | null;
  attachments: Array<{
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    url: string;
  }>;
};

export type MyWorkOrder = {
  id: string;
  incident_id: string;
  technician_id?: string;
  assigned_by?: string | null;
  status: string;
  respond_due_at: string;
  resolve_due_at: string;
  assigned_at: string | null;
  updated_at?: string;
  assignment_role?: "primary" | "support";
  assignees?: Array<{
    technician_id: string;
    assignment_role: "primary" | "support";
    full_name: string;
  }>;
  incidents: WorkOrderIncident | WorkOrderIncident[] | null;
};

export type WorkOrderDetail = {
  workOrder: MyWorkOrder;
  events: WorkOrderEvent[];
};

export function getIncident(order: MyWorkOrder) {
  return Array.isArray(order.incidents) ? order.incidents[0] : order.incidents;
}

export async function getMyWorkOrders() {
  return (await apiFetch<{ data: MyWorkOrder[] }>("/work-orders/mine")).data;
}

export async function getMyWorkOrderHistory() {
  return (await apiFetch<{ data: MyWorkOrder[] }>("/work-orders/history")).data;
}

export async function getDispatcherWorkOrderHistory() {
  return (
    await apiFetch<{ data: MyWorkOrder[] }>("/dispatch/work-orders/history")
  ).data;
}

export async function getWorkOrderDetail(id: string) {
  return (await apiFetch<{ data: WorkOrderDetail }>(`/work-orders/${id}`)).data;
}

export async function performWorkOrderAction(input: {
  id: string;
  action: string;
  note?: string;
  attachments?: WorkOrderAttachment[];
}) {
  return (
    await apiFetch<{ data: { id: string; status: string } }>(
      `/work-orders/${input.id}/actions`,
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    )
  ).data;
}

export async function uploadWorkOrderAttachments(files: File[]) {
  const storageClient = supabase;
  if (!storageClient) throw new Error("ยังไม่ได้ตั้งค่าการเชื่อมต่อระบบ");
  if (files.length > 3) throw new Error("แนบภาพได้สูงสุด 3 ภาพ");
  return Promise.all(
    files.map(async (file): Promise<WorkOrderAttachment> => {
      if (!["image/jpeg", "image/png"].includes(file.type))
        throw new Error("รองรับเฉพาะไฟล์ JPG, JPEG และ PNG");
      if (file.size > 3 * 1024 * 1024)
        throw new Error("ไฟล์ต้องมีขนาดไม่เกิน 3 MB");
      const signed = await apiFetch<{
        data: { bucket: string; objectPath: string; token: string };
      }>("/uploads/work-order-attachments", {
        method: "POST",
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
        }),
      });
      const { error } = await storageClient.storage
        .from(signed.data.bucket)
        .uploadToSignedUrl(signed.data.objectPath, signed.data.token, file, {
          contentType: file.type,
        });
      if (error) throw new Error(error.message);
      return {
        objectPath: signed.data.objectPath,
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      };
    }),
  );
}
