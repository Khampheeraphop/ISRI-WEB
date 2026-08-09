import { apiFetch } from "../api/apiClient";
import type { AuthProfile, TechnicianSpecialty } from "../../types/auth";

interface ApiProfile {
  id: string;
  email: string;
  full_name: string;
  approval_status: AuthProfile["approvalStatus"];
  role: AuthProfile["role"];
  requested_position: string | null;
  technician_specialties: TechnicianSpecialty[];
}

const toProfile = (value: ApiProfile): AuthProfile => ({
  id: value.id,
  email: value.email,
  fullName: value.full_name,
  approvalStatus: value.approval_status,
  role: value.role,
  requestedPosition: value.requested_position,
  technicianSpecialties: value.technician_specialties,
});

export async function getMyProfile() {
  const result = await apiFetch<{ data: ApiProfile }>("/me");
  return toProfile(result.data);
}

export async function saveOnboarding(
  requestedPosition: string,
  technicianSpecialties: TechnicianSpecialty[],
) {
  const result = await apiFetch<{ data: ApiProfile }>("/me/onboarding", {
    method: "PATCH",
    body: JSON.stringify({ requestedPosition, technicianSpecialties }),
  });
  return toProfile(result.data);
}
