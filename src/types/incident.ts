export const incidentCategories = [
  "ไฟฟ้า",
  "ประปา",
  "เครื่องปรับอากาศ",
  "ลิฟต์",
  "โครงสร้าง/พื้นผิวอาคาร (ผนัง พื้น เพดาน ประตู)",
] as const;

export const urgencyLevels = ["critical", "urgent", "normal"] as const;
export const incidentStatuses = [
  "submitted",
  "assigned",
  "in_progress",
  "waiting_parts",
  "done",
] as const;

export type IncidentCategory = (typeof incidentCategories)[number];
export type UrgencyLevel = (typeof urgencyLevels)[number];
export type IncidentStatus = (typeof incidentStatuses)[number];

export interface Location {
  id: string;
  building: string;
  floor: string;
  zone: string;
}

export interface Incident {
  id: string;
  ticketNumber: string;
  locationId: string;
  locationLabel: string;
  assetName?: string;
  category: IncidentCategory;
  otherCategory?: string;
  urgencyReported: UrgencyLevel;
  description: string;
  photoUrls: string[];
  reporterId: string;
  status: IncidentStatus;
  createdAt: string;
}

export type CreateIncident = Omit<
  Incident,
  "id" | "ticketNumber" | "status" | "createdAt"
>;
