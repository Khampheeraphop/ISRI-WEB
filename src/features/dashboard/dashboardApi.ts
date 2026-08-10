import { apiFetch } from "../api/apiClient";

export type DashboardSummary = {
  generatedAt: string;
  periodMonth: string;
  attention: {
    overdue: number;
    nearDue: number;
    pendingAssignment: number;
  };
  sla: {
    responseOnTimeRate: number | null;
    resolutionOnTimeRate: number | null;
    averageResolutionMinutes: number | null;
  };
  statusCounts: Array<{ status: string; count: number }>;
  hotspots: Array<{
    locationLabel: string;
    assetName: string | null;
    count: number;
    openCount: number;
  }>;
  technicianWorkload: Array<{
    technicianId: string;
    technicianName: string;
    assignedCount: number;
  }>;
  incentives: {
    totalWalletPoints: number;
    pointsIssued: number;
    redemptionCount: number;
    activeRewardCount: number;
    activeCampaignCount: number;
  };
};

export async function getDashboardSummary(month: string) {
  const response = await apiFetch<{ data: DashboardSummary }>(
    `/dashboard/summary?month=${month}`,
  );
  return response.data;
}

export type MonthlyReportingCount = { month: string; count: number };

export async function getMonthlyReportingCounts(month: string) {
  const response = await apiFetch<{ data: MonthlyReportingCount[] }>(
    `/dashboard/reporting-rate?month=${encodeURIComponent(month)}`,
  );
  return response.data;
}
