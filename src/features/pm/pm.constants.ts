import type { PMSchedule } from "../../types/pm";

export const pmDateInput = (date: string | Date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));

export const getPMDueDetail = (schedule: PMSchedule) => {
  const days = Math.round(
    (Date.parse(pmDateInput(schedule.nextDueAt)) - Date.parse(pmDateInput())) /
      86_400_000,
  );
  if (days < 0)
    return {
      label: `เกินกำหนด ${Math.abs(days)} วัน`,
      color: "error" as const,
    };
  if (days === 0) return { label: "ครบกำหนดวันนี้", color: "warning" as const };
  if (days <= 30)
    return { label: `ครบกำหนดใน ${days} วัน`, color: "warning" as const };
  return { label: `ครบกำหนดใน ${days} วัน`, color: "success" as const };
};

export const formatPMDate = (date: string | null) =>
  date
    ? new Intl.DateTimeFormat("th-TH", {
        timeZone: "Asia/Bangkok",
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(date))
    : "ยังไม่มีบันทึก";
