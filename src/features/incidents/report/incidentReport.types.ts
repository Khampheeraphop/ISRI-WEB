import type { IncidentCategory, UrgencyLevel } from "../../../types/incident";

export type IncidentReportFormValues = {
  building: string;
  floor: string;
  zone: string;
  assetName: string;
  category: IncidentCategory;
  otherCategory?: string;
  urgencyReported: UrgencyLevel;
  description: string;
  photos?: File[];
};
