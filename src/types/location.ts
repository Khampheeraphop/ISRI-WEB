export interface ManagedLocation {
  id: string;
  code: string;
  building: string;
  floor: string;
  zone: string;
  assetName?: string;
  isReportingLocked?: boolean;
}

export type CreateManagedLocation = Omit<ManagedLocation, "id">;
