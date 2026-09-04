export interface PMSchedule {
  id: string;
  locationId: string;
  locationLabel: string;
  assetName: string;
  planDetails: string;
  intervalMonths: number;
  lastDoneAt: string | null;
  nextDueAt: string;
  assignedTechnicianId: string | null;
  assignedTechnicianName: string | null;
}

export interface PMLog {
  id: string;
  scheduleId: string;
  completedAt: string;
  createdAt: string | null;
  technicianId: string;
  technicianName: string | null;
  notes: string;
}

export type CreatePMSchedule = Omit<PMSchedule, "id" | "nextDueAt">;
