export interface PointWallet {
  id: string;
  userId: string;
  balance: number;
}

export type PointTransactionType = "earn" | "redeem";

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
}

export interface RewardRedemption {
  id: string;
  userId: string;
  rewardItemId: string;
  redeemedAt: string;
}

export type CreateRewardItem = Omit<RewardItem, "id">;
