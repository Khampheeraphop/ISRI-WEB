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
  "pending_assignment",
  "assigned",
  "in_progress",
  "pending_parts_approval",
  "waiting_parts",
  "pending_repair_approval",
  "done",
] as const;

export const incidentCategoryOptions = [
  { value: "electrical", label: incidentCategories[0] },
  { value: "plumbing", label: incidentCategories[1] },
  { value: "air_conditioning", label: incidentCategories[2] },
  { value: "elevator", label: incidentCategories[3] },
  { value: "building", label: incidentCategories[4] },
] as const;

export type IncidentCategory = (typeof incidentCategories)[number];
export type IncidentCategoryCode =
  (typeof incidentCategoryOptions)[number]["value"];
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
