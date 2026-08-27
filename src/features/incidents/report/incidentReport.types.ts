import type { IncidentCategoryCode } from "../../../types/incident";

export type IncidentReportFormValues = {
  building: string;
  floor: string;
  zone: string;
  assetName: string;
  category: IncidentCategoryCode;
  description: string;
  photos?: File[];
};
