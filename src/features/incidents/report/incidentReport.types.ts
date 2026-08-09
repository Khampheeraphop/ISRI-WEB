import type {
  IncidentCategoryCode,
  UrgencyLevel,
} from "../../../types/incident";

export type IncidentReportFormValues = {
  building: string;
  floor: string;
  zone: string;
  assetName: string;
  category: IncidentCategoryCode;
  urgencyReported: UrgencyLevel;
  description: string;
  photos?: File[];
};
