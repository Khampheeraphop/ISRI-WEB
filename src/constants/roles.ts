import type { Role } from "../types/user";

export const roleLabels: Record<Role, string> = {
  reporter: "ผู้แจ้งเหตุ",
  technician: "ช่างซ่อมบำรุง",
  dispatcher: "ผู้จัดสรรงาน",
  admin: "ผู้ดูแลระบบ",
};

export const systemRoleOptions = (
  Object.entries(roleLabels) as [Role, string][]
).map(([value, label]) => ({ value, label }));

export function getRoleLabel(value: string | null | undefined) {
  if (!value) return undefined;
  return Object.hasOwn(roleLabels, value) ? roleLabels[value as Role] : value;
}
