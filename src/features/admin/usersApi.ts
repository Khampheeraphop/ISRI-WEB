import { apiFetch } from "../api/apiClient";
import type { ApprovalStatus, TechnicianSpecialty } from "../../types/auth";
import type { Role } from "../../types/user";

export interface ManagedUser {
  id: string;
  email: string;
  fullName: string;
  approvalStatus: ApprovalStatus;
  role: Role | null;
  requestedPosition: string | null;
  technicianSpecialties: TechnicianSpecialty[];
  createdAt: string;
}

interface ManagedUserResponse {
  id: string;
  email: string;
  full_name: string;
  approval_status: ApprovalStatus;
  role: Role | null;
  requested_position: string | null;
  technician_specialties: TechnicianSpecialty[];
  created_at: string;
}

const toManagedUser = (user: ManagedUserResponse): ManagedUser => ({
  id: user.id,
  email: user.email,
  fullName: user.full_name,
  approvalStatus: user.approval_status,
  role: user.role,
  requestedPosition: user.requested_position,
  technicianSpecialties: user.technician_specialties,
  createdAt: user.created_at,
});

export async function getManagedUsers() {
  const result = await apiFetch<{ data: ManagedUserResponse[] }>(
    "/admin/users",
  );
  return result.data.map(toManagedUser);
}

export async function decideUserApproval(input: {
  id: string;
  approvalStatus: ApprovalStatus;
  role?: Role;
  technicianSpecialties?: TechnicianSpecialty[];
  note?: string;
}) {
  const result = await apiFetch<{ data: ManagedUserResponse }>(
    `/admin/users/${input.id}/approval`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
  return toManagedUser(result.data);
}

export async function bulkApproveReporters(userIds: string[]) {
  return apiFetch<{ data: { approvedCount: number } }>(
    "/admin/users/bulk-approve-reporters",
    { method: "POST", body: JSON.stringify({ userIds }) },
  );
}
