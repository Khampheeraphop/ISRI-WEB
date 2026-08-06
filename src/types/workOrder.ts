import type { UrgencyLevel } from "./incident";

export type WorkOrderStatus = "pending" | "in_progress" | "waiting_parts" | "done";

export interface SLARule {
  id: string;
  urgencyLevel: UrgencyLevel;
  responseMinutes: number;
  resolveMinutes: number;
}

export interface WorkOrderHistoryItem { status: WorkOrderStatus; changedAt: string; }

export interface WorkOrder {
  id: string;
  incidentId: string;
  technicianId: string;
  status: WorkOrderStatus;
  statusHistory: WorkOrderHistoryItem[];
  respondDueAt: string;
  resolveDueAt: string;
  repairPhotoUrls: string[];
}
