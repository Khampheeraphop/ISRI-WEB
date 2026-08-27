import type { UrgencyLevel } from "../types/incident";

const locationCodePattern = /^BLD-([A-Z]+)-F(\d+)-Z(\d+)$/i;
const managedLocationCodePattern = /^LOC-[A-Z0-9]{12}$/i;

export const urgencyPresentation: Record<
  UrgencyLevel,
  { label: string; color: "error" | "warning" | "info"; hex: string }
> = {
  critical: { label: "วิกฤต", color: "error", hex: "#C1443A" },
  urgent: { label: "เร่งด่วน", color: "warning", hex: "#C68A2E" },
  normal: { label: "ปกติ", color: "info", hex: "#3E6FA6" },
};

export function isLocationCode(
  locationCode: string | null,
): locationCode is string {
  return (
    typeof locationCode === "string" &&
    (managedLocationCodePattern.test(locationCode) ||
      locationCodePattern.test(locationCode))
  );
}

export function getLocationLabel(locationCode: string) {
  const match = locationCodePattern.exec(locationCode);
  if (!match) return `จุดแจ้งเหตุ ${locationCode}`;
  return `อาคาร ${match[1].toUpperCase()} · ชั้น ${match[2]} · โซน ${match[3]}`;
}

export function getLocationDetails(locationCode: string) {
  const match = locationCodePattern.exec(locationCode);
  if (!match)
    return {
      building: "ไม่ระบุอาคาร",
      floor: "ไม่ระบุชั้น",
      zone: "ไม่ระบุโซน",
    };
  return {
    building: `อาคาร ${match[1].toUpperCase()}`,
    floor: `ชั้น ${match[2]}`,
    zone: `โซน ${match[3]}`,
  };
}

export function formatBangkokDate(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value));
}
