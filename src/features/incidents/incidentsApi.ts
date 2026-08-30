import { apiFetch } from "../api/apiClient";
import { supabase } from "../../lib/supabase/client";
import type {
  Incident,
  IncidentCategory,
  IncidentStatus,
  UrgencyLevel,
} from "../../types/incident";
import type { ManagedLocation } from "../../types/location";

type IncidentResponse = {
  id: string;
  ticket_number: string;
  location_id: string;
  location_label: string;
  asset_name: string | null;
  category: IncidentCategory;
  other_category: string | null;
  urgency_reported: UrgencyLevel;
  description: string;
  status: IncidentStatus;
  rejection_reason?: string | null;
  rejected_at?: string | null;
  created_at: string;
};

type LocationResponse = {
  id: string;
  code: string;
  building: string;
  floor: string;
  zone: string;
  asset_name: string | null;
  is_reporting_locked?: boolean;
};

type Attachment = {
  objectPath: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
};

export const toIncident = (incident: IncidentResponse): Incident => ({
  id: incident.id,
  ticketNumber: incident.ticket_number,
  locationId: incident.location_id,
  locationLabel: incident.location_label,
  assetName: incident.asset_name ?? undefined,
  category: incident.category,
  otherCategory: incident.other_category ?? undefined,
  urgencyReported: incident.urgency_reported,
  description: incident.description,
  photoUrls: [],
  reporterId: "",
  status: incident.status,
  rejectionReason: incident.rejection_reason ?? undefined,
  rejectedAt: incident.rejected_at ?? undefined,
  createdAt: incident.created_at,
});

export async function getLocationByCode(
  code: string,
): Promise<ManagedLocation> {
  const result = await apiFetch<{ data: LocationResponse }>(
    `/locations/code/${encodeURIComponent(code)}`,
  );
  return {
    id: result.data.id,
    code: result.data.code,
    building: result.data.building,
    floor: result.data.floor,
    zone: result.data.zone,
    assetName: result.data.asset_name ?? undefined,
    isReportingLocked: result.data.is_reporting_locked ?? false,
  };
}

export async function getMyIncidents() {
  const result = await apiFetch<{ data: IncidentResponse[] }>(
    "/incidents/mine",
  );
  return result.data.map(toIncident);
}

export type IncidentDetail = Incident & {
  attachments: Array<{
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    url: string;
  }>;
};

export async function getMyIncidentDetail(id: string): Promise<IncidentDetail> {
  const result = await apiFetch<{
    data: IncidentResponse & { attachments: IncidentDetail["attachments"] };
  }>(`/incidents/${id}`);
  return { ...toIncident(result.data), attachments: result.data.attachments };
}

export type IncidentHistory = {
  workOrder: {
    id: string;
    status: string;
    assigned_at: string | null;
    technician_name: string | null;
    support_technician_names?: string[];
  } | null;
  events: Array<{
    id: string;
    status: string;
    changed_at: string;
    changed_by: string | null;
    changed_by_name: string;
    note: string | null;
    event_type: string;
    attachments: Array<{
      fileName: string;
      mimeType: string;
      sizeBytes: number;
      url: string;
    }>;
  }>;
};
export async function getMyIncidentHistory(id: string) {
  return (await apiFetch<{ data: IncidentHistory }>(`/incidents/${id}/history`))
    .data;
}

async function uploadIncidentAttachment(file: File): Promise<Attachment> {
  if (!supabase) throw new Error("ยังไม่ได้ตั้งค่าการเชื่อมต่อระบบ");
  const signed = await apiFetch<{
    data: { bucket: string; objectPath: string; token: string };
  }>("/uploads/incident-attachments", {
    method: "POST",
    body: JSON.stringify({
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    }),
  });
  const { error } = await supabase.storage
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
}

export async function createIncident(input: {
  locationId: string;
  assetName: string;
  category: string;
  otherCategory?: string;
  description: string;
  photos: File[];
}) {
  const attachments = await Promise.all(
    input.photos.map(uploadIncidentAttachment),
  );
  const result = await apiFetch<{ data: IncidentResponse }>("/incidents", {
    method: "POST",
    body: JSON.stringify({ ...input, photos: undefined, attachments }),
  });
  return toIncident(result.data);
}
