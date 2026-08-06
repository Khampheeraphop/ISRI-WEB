export interface PMSchedule {
  id: string;
  locationId: string;
  locationLabel: string;
  assetName: string;
  intervalMonths: number;
  lastDoneAt: string;
  nextDueAt: string;
}

export interface PMLog {
  id: string;
  scheduleId: string;
  completedAt: string;
  technicianId: string;
  notes: string;
}

export type CreatePMSchedule = Omit<PMSchedule, "id" | "nextDueAt">;
