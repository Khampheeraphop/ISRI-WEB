import type {
  CampaignAwardStatus,
  CampaignPeriodType,
  CampaignStatus,
  CreateRewardCampaign,
  RewardCampaign,
} from "../../types/reward";
import { apiFetch } from "../api/apiClient";

type CampaignResponse = {
  id: string;
  name: string;
  period_type: CampaignPeriodType;
  start_date: string;
  end_date: string;
  prize_description: string;
  reward_item_id: string | null;
  winner_count: number;
  reserved_reward_count: number;
  status: CampaignStatus;
  reward_item: {
    id: string;
    name: string;
    description: string;
    stock: number;
    is_active: boolean;
    image_url: string | null;
  } | null;
  campaign_awards: Array<{
    id: string;
    user_id: string;
    rank: number;
    status: CampaignAwardStatus;
    awarded_at: string;
    fulfilled_at: string | null;
    cancelled_at: string | null;
    admin_note: string | null;
    profiles: { full_name: string } | null;
  }>;
};

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
  rewardItemId: campaign.reward_item_id ?? undefined,
  reward: campaign.reward_item
    ? {
        id: campaign.reward_item.id,
        name: campaign.reward_item.name,
        description: campaign.reward_item.description,
        stock: campaign.reward_item.stock,
        isActive: campaign.reward_item.is_active,
        imageUrl: campaign.reward_item.image_url,
      }
    : undefined,
  winnerCount: campaign.winner_count ?? 1,
  reservedRewardCount: campaign.reserved_reward_count ?? 0,
  awards: (campaign.campaign_awards ?? [])
    .map((award) => ({
      id: award.id,
      userId: award.user_id,
      winnerName: award.profiles?.full_name ?? "ผู้ใช้งานระบบ",
      rank: award.rank,
      status: award.status,
      awardedAt: award.awarded_at,
      fulfilledAt: award.fulfilled_at ?? undefined,
      cancelledAt: award.cancelled_at ?? undefined,
      adminNote: award.admin_note ?? undefined,
    }))
    .sort((left, right) => left.rank - right.rank),
  status: campaign.status,
});

const toPayload = (campaign: CreateRewardCampaign) => ({
  name: campaign.name,
  periodType: campaign.periodType,
  startDate: campaign.startDate,
  endDate: campaign.endDate,
  rewardItemId: campaign.rewardItemId,
  winnerCount: campaign.winnerCount,
});

export async function getCampaigns() {
  const result = await apiFetch<{ data: CampaignResponse[] }>("/campaigns");
  return result.data.map(toCampaign);
}

export async function createCampaign(input: CreateRewardCampaign) {
  const result = await apiFetch<{ data: CampaignResponse }>(
    "/admin/campaigns",
    {
      method: "POST",
      body: JSON.stringify(toPayload(input)),
    },
  );
  return toCampaign(result.data);
}

export async function updateCampaign(
  input: CreateRewardCampaign & { id: string },
) {
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

export async function updateCampaignAward(input: {
  id: string;
  status: "fulfilled" | "cancelled";
  note?: string;
}) {
  return apiFetch<{ data: { id: string; status: CampaignAwardStatus } }>(
    `/admin/campaign-awards/${input.id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status: input.status, note: input.note }),
    },
  );
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
