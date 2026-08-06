import type { CampaignPeriodType, CampaignStatus } from "../../types/reward";

export const campaignPeriodLabel: Record<CampaignPeriodType, string> = {
  monthly: "รายเดือน",
  yearly: "รายปี",
  custom: "กำหนดช่วงเวลา",
};

export const campaignStatusLabel: Record<CampaignStatus, string> = {
  active: "กำลังดำเนินการ",
  ended: "ปิดรอบแล้ว",
};

export const formatCampaignPeriod = (startDate: string, endDate: string) =>
  `${new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${startDate}T00:00:00`))} – ${new Intl.DateTimeFormat(
    "th-TH",
    { day: "numeric", month: "short", year: "numeric" },
  ).format(new Date(`${endDate}T00:00:00`))}`;
