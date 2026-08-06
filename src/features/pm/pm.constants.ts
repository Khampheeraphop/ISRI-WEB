import type { PMSchedule } from "../../types/pm";

export const pmLocations = [
  { id: "BLD-A-F2-Z03", label: "อาคาร A · ชั้น 2 · โซน 03" },
  { id: "BLD-B-F1-Z01", label: "อาคาร B · ชั้น 1 · โซน 01" },
  { id: "BLD-C-F3-Z02", label: "อาคาร C · ชั้น 3 · โซน 02" },
];

export const getPMDueDetail = (schedule: PMSchedule) => {
  const days = Math.ceil((new Date(schedule.nextDueAt).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return { label: `เกินกำหนด ${Math.abs(days)} วัน`, color: "error" as const };
  if (days <= 14) return { label: `ครบกำหนดใน ${days} วัน`, color: "warning" as const };
  return { label: `ครบกำหนดใน ${days} วัน`, color: "success" as const };
};

export const formatPMDate = (date: string) =>
  new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "numeric" }).format(new Date(date));
