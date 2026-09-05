import { apiFetch } from "../api/apiClient";

export type DashboardHotspot = {
  key?: string;
  locationLabel: string;
  assetName: string | null;
  count: number;
  openCount: number;
};

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
    averageResponseMinutes: number | null;
    resolutionOnTimeRate: number | null;
    averageClosureMinutes: number | null;
    respondedCount?: number;
    closedCount?: number;
    responseOnTimeCount?: number;
    resolutionOnTimeCount?: number;
    /** Kept temporarily so a locally running frontend remains compatible during deployment. */
    averageResolutionMinutes?: number | null;
  };
  statusCounts: Array<{ status: string; count: number }>;
  hotspots: DashboardHotspot[];
  hotspotGroups?: Record<
    "building" | "floor" | "area" | "asset",
    DashboardHotspot[]
  >;
  technicianWorkload: Array<{
    technicianId: string;
    technicianName: string;
    assignedCount: number;
    primaryCount?: number;
    supportCount?: number;
    activeCount?: number;
    overdueCount?: number;
    pendingReviewCount?: number;
    pmAssignedCount?: number;
    pmDueCount?: number;
  }>;
  pm?: {
    overdueCount: number;
    dueSoonCount: number;
    unassignedCount?: number;
    completedCount?: number;
    completedPlanCount?: number;
    latestCompletions?: Array<{
      id: string;
      scheduleId: string;
      completedAt: string;
      recordedAt: string;
      notes: string;
      technicianName: string;
      assetName: string;
      locationLabel: string;
    }>;
    items: Array<{
      id: string;
      locationLabel: string;
      assetName: string;
      nextDueAt: string;
      state: "overdue" | "due_soon";
    }>;
  };
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
    // Keep the deployed API route during the rollout. The backend accepts
    // both names, while older Cloud deployments only know reporting-rate.
    `/dashboard/reporting-rate?month=${encodeURIComponent(month)}`,
  );
  return response.data;
}
