export interface PointWallet {
  id: string;
  userId: string;
  balance: number;
}

export type PointTransactionType = "earn" | "redeem" | "refund";

export interface PointTransaction {
  id: string;
  userId: string;
  amount: number;
  type: PointTransactionType;
  reason: string;
  refIncidentId?: string;
  refRewardItemId?: string;
  createdAt: string;
}

export interface RewardItem {
  id: string;
  name: string;
  description: string;
  pointCost: number;
  stock: number;
  isActive: boolean;
  imageFileStorageId?: string;
  rewardPeriod: "standard" | "annual";
}

export interface RewardRedemption {
  id: string;
  userId: string;
  rewardItemId: string;
  redeemedAt: string;
  status: "pending" | "fulfilled" | "cancelled";
  fulfillmentMethod: "pickup" | "delivery";
  recipientName: string;
  phone: string;
  deliveryAddress?: string;
}

export type CreateRewardItem = Omit<RewardItem, "id">;

export type CampaignPeriodType = "monthly" | "yearly" | "custom";
export type CampaignStatus = "active" | "ended";

export interface RewardCampaign {
  id: string;
  name: string;
  periodType: CampaignPeriodType;
  startDate: string;
  endDate: string;
  prizeDescription: string;
  status: CampaignStatus;
}

export interface CampaignScore {
  id: string;
  campaignId: string;
  userId: string;
  points: number;
  lastScoredAt?: string;
}

export type CreateRewardCampaign = Omit<RewardCampaign, "id">;

export interface FileStorage {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  publicUrl: string;
  uploadedAt: string;
}
