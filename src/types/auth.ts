import type { Role } from "./user";

export type ApprovalStatus = "pending" | "approved" | "rejected";
export type TechnicianSpecialty =
  | "electrical"
  | "plumbing"
  | "air_conditioning"
  | "elevator"
  | "building";

export interface AuthProfile {
  id: string;
  email: string;
  fullName: string;
  approvalStatus: ApprovalStatus;
  role: Role | null;
  requestedPosition: string | null;
  technicianSpecialties: TechnicianSpecialty[];
}
