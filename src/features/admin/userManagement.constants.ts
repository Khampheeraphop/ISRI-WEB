import type { TechnicianSpecialty } from "../../types/auth";
import type { Role } from "../../types/user";

export const roleLabels: Record<Role, string> = {
  reporter: "ผู้แจ้งเหตุ",
  technician: "ช่างซ่อมบำรุง",
  admin: "ผู้ดูแลระบบ",
};

export const statusLabels = {
  pending: "รออนุมัติ",
  approved: "อนุมัติแล้ว",
  rejected: "ไม่อนุมัติ",
} as const;

export const statusColors = {
  pending: "warning",
  approved: "success",
  rejected: "error",
} as const;

export const specialtyOptions: { value: TechnicianSpecialty; label: string }[] = [
  { value: "electrical", label: "งานไฟฟ้า" },
  { value: "plumbing", label: "งานประปา" },
  { value: "air_conditioning", label: "เครื่องปรับอากาศ" },
  { value: "elevator", label: "ลิฟต์" },
  { value: "building", label: "โครงสร้างและพื้นผิวอาคาร" },
];
