import { apiFetch } from "../api/apiClient";
import type { CampaignPeriodType, CampaignStatus, RewardCampaign } from "../../types/reward";

type CampaignResponse = {
  id: string;
  name: string;
  period_type: CampaignPeriodType;
  start_date: string;
  end_date: string;
  prize_description: string;
  status: CampaignStatus;
};

type CampaignInput = Omit<RewardCampaign, "id" | "status">;

export type CampaignLeaderboardScore = {
  campaignId: string;
  userId: string;
  name: string;
  points: number;
  lastScoredAt?: string;
};

const toCampaign = (campaign: CampaignResponse): RewardCampaign => ({
  id: campaign.id,
  name: campaign.name,
  periodType: campaign.period_type,
  startDate: campaign.start_date,
  endDate: campaign.end_date,
  prizeDescription: campaign.prize_description,
  status: campaign.status,
});

const toPayload = (campaign: CampaignInput) => ({
  name: campaign.name,
  periodType: campaign.periodType,
  startDate: campaign.startDate,
  endDate: campaign.endDate,
  prizeDescription: campaign.prizeDescription,
});

export async function getCampaigns() {
  const result = await apiFetch<{ data: CampaignResponse[] }>("/campaigns");
  return result.data.map(toCampaign);
}

export async function createCampaign(input: CampaignInput) {
  const result = await apiFetch<{ data: CampaignResponse }>("/admin/campaigns", {
    method: "POST",
    body: JSON.stringify(toPayload(input)),
  });
  return toCampaign(result.data);
}

export async function updateCampaign(input: CampaignInput & { id: string }) {
  const result = await apiFetch<{ data: CampaignResponse }>(
    `/admin/campaigns/${input.id}`,
    { method: "PATCH", body: JSON.stringify(toPayload(input)) },
  );
  return toCampaign(result.data);
}

export async function closeCampaign(id: string) {
  const result = await apiFetch<{ data: CampaignResponse }>(
    `/admin/campaigns/${id}/close`,
    { method: "POST" },
  );
  return toCampaign(result.data);
}

export async function getCampaignLeaderboard(id: string) {
  const result = await apiFetch<{
    data: {
      campaign: CampaignResponse;
      scores: Array<{
        campaign_id: string;
        user_id: string;
        full_name: string;
        points: number;
        last_scored_at: string | null;
      }>;
    };
  }>(`/campaigns/${id}/leaderboard`);
  return {
    campaign: toCampaign(result.data.campaign),
    scores: result.data.scores.map((score) => ({
      campaignId: score.campaign_id,
      userId: score.user_id,
      name: score.full_name,
      points: score.points,
      lastScoredAt: score.last_scored_at ?? undefined,
    })),
  };
}
