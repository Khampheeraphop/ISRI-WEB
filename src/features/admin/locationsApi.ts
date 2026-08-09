import { apiFetch } from "../api/apiClient";
import type { ManagedLocation } from "../../types/location";

type LocationResponse = {
  id: string;
  code: string;
  building: string;
  floor: string;
  zone: string;
  asset_name: string | null;
};

export type LocationInput = Omit<ManagedLocation, "id">;

const toManagedLocation = (location: LocationResponse): ManagedLocation => ({
  id: location.id,
  code: location.code,
  building: location.building,
  floor: location.floor,
  zone: location.zone,
  assetName: location.asset_name ?? undefined,
});

export async function getManagedLocations() {
  const result = await apiFetch<{ data: LocationResponse[] }>("/locations");
  return result.data.map(toManagedLocation);
}

export async function createManagedLocation(input: LocationInput) {
  const result = await apiFetch<{ data: LocationResponse }>("/admin/locations", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return toManagedLocation(result.data);
}

export async function updateManagedLocation(input: LocationInput & { id: string }) {
  const result = await apiFetch<{ data: LocationResponse }>(`/admin/locations/${input.id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return toManagedLocation(result.data);
}

export async function deleteManagedLocation(id: string) {
  await apiFetch<{ data: { id: string } }>(`/admin/locations/${id}`, { method: "DELETE" });
}
