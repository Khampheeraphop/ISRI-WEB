import type { PMSchedule } from "../../types/pm";

export const getPMDueDetail = (schedule: PMSchedule) => {
  const days = Math.ceil(
    (new Date(schedule.nextDueAt).getTime() - Date.now()) / 86_400_000,
  );
  if (days < 0)
    return { label: `เกินกำหนด ${Math.abs(days)} วัน`, color: "error" as const };
  if (days <= 14)
    return { label: `ครบกำหนดใน ${days} วัน`, color: "warning" as const };
  return { label: `ครบกำหนดใน ${days} วัน`, color: "success" as const };
};

export const formatPMDate = (date: string) =>
  new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
