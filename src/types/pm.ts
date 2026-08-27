export interface PMSchedule {
  id: string;
  locationId: string;
  locationLabel: string;
  assetName: string;
  planDetails: string;
  intervalMonths: number;
  lastDoneAt: string;
  nextDueAt: string;
}

export interface PMLog {
  id: string;
  scheduleId: string;
  completedAt: string;
  technicianId: string;
  technicianName: string | null;
  notes: string;
}

export type CreatePMSchedule = Omit<PMSchedule, "id" | "nextDueAt">;
