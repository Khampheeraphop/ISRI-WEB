import { apiFetch } from "../api/apiClient";

export type DashboardSummary = {
  generatedAt: string;
  periodDays: number;
  attention: {
    overdue: number;
    nearDue: number;
    pendingAssignment: number;
    pendingReview: number;
  };
  sla: {
    responseOnTimeRate: number | null;
    resolutionOnTimeRate: number | null;
    averageResolutionMinutes: number | null;
  };
  trend: Array<{ month: string; reported: number; completed: number }>;
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
    activeCount: number;
  }>;
  attentionItems: {
    unassigned: Array<{
      incidentId: string;
      ticketNumber: string;
      locationLabel: string;
      status: string;
      createdAt: string;
    }>;
    review: Array<{
      workOrderId: string;
      ticketNumber: string;
      locationLabel: string;
      status: string;
      resolveDueAt: string;
    }>;
  };
};

export async function getDashboardSummary(days: number) {
  const response = await apiFetch<{ data: DashboardSummary }>(
    `/dashboard/summary?days=${days}`,
  );
  return response.data;
}
