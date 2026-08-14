import { apiFetch } from "../api/apiClient";
import { supabase } from "../../lib/supabase/client";
import type { PointTransaction, RewardItem } from "../../types/reward";

type RewardResponse = {
  id: string;
  name: string;
  description: string;
  point_cost: number;
  stock: number;
  is_active: boolean;
  image_file_id: string | null;
  image_url: string | null;
  reward_period: "standard" | "annual";
};

export type Reward = RewardItem & { imageUrl: string | null };
export type RewardInput = Omit<RewardItem, "id" | "imageFileStorageId"> & {
  image?: File;
};
export type RewardRedemptionInput = {
  rewardItemId: string;
  fulfillmentMethod: "pickup" | "delivery";
  recipientName: string;
  phone: string;
  deliveryAddress?: string;
  requesterNote?: string;
};
export type AdminRewardRedemption = {
  id: string;
  user_id: string;
  status: "pending" | "fulfilled" | "cancelled";
  fulfillment_method: "pickup" | "delivery";
  recipient_name: string;
  phone: string;
  delivery_address: string | null;
  requester_note: string | null;
  admin_note: string | null;
  redeemed_at: string;
  fulfilled_at: string | null;
  cancelled_at: string | null;
  profiles: { full_name: string; email: string } | null;
  reward_items: { name: string; point_cost: number } | null;
};

const toReward = (item: RewardResponse): Reward => ({
  id: item.id,
  name: item.name,
  description: item.description,
  pointCost: item.point_cost,
  stock: item.stock,
  isActive: item.is_active,
  imageFileStorageId: item.image_file_id ?? undefined,
  imageUrl: item.image_url,
  rewardPeriod: item.reward_period,
});

async function uploadRewardImage(file: File) {
  if (!supabase) throw new Error("ยังไม่ได้ตั้งค่าการเชื่อมต่อระบบ");
  if (!["image/jpeg", "image/png"].includes(file.type))
    throw new Error("รองรับเฉพาะ JPG, JPEG และ PNG");
  if (file.size > 3 * 1024 * 1024)
    throw new Error("ไฟล์ต้องมีขนาดไม่เกิน 3 MB");
  const signed = await apiFetch<{
    data: { bucket: string; objectPath: string; token: string };
  }>("/uploads/reward-images", {
    method: "POST",
    body: JSON.stringify({
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    }),
  });
  const { error } = await supabase.storage
    .from(signed.data.bucket)
    .uploadToSignedUrl(signed.data.objectPath, signed.data.token, file, {
      contentType: file.type,
    });
  if (error) throw new Error(error.message);
  return {
    objectPath: signed.data.objectPath,
    fileName: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
  };
}

async function rewardPayload(input: RewardInput) {
  return {
    name: input.name,
    description: input.description,
    pointCost: input.pointCost,
    stock: input.stock,
    isActive: input.isActive,
    rewardPeriod: input.rewardPeriod,
    ...(input.image ? { image: await uploadRewardImage(input.image) } : {}),
  };
}

export async function getAdminRewards() {
  const result = await apiFetch<{ data: RewardResponse[] }>("/admin/rewards");
  return result.data.map(toReward);
}
export async function getRewardCatalog() {
  const result = await apiFetch<{ data: RewardResponse[] }>("/rewards/catalog");
  return result.data.map(toReward);
}
export async function createReward(input: RewardInput) {
  const result = await apiFetch<{ data: RewardResponse }>("/admin/rewards", {
    method: "POST",
    body: JSON.stringify(await rewardPayload(input)),
  });
  return toReward(result.data);
}
export async function updateReward(input: RewardInput & { id: string }) {
  const result = await apiFetch<{ data: RewardResponse }>(
    `/admin/rewards/${input.id}`,
    { method: "PATCH", body: JSON.stringify(await rewardPayload(input)) },
  );
  return toReward(result.data);
}
export async function deleteReward(id: string) {
  await apiFetch<{ data: { id: string } }>(`/admin/rewards/${id}`, {
    method: "DELETE",
  });
}
export async function getRewardWallet() {
  const result = await apiFetch<{
    data: {
      balance: number;
      transactions: Array<{
        id: string;
        amount: number;
        transaction_type: PointTransaction["type"];
        reason: string;
        ref_incident_id: string | null;
        ref_reward_item_id: string | null;
        created_at: string;
      }>;
      redemptions: Array<{
        id: string;
        status: "pending" | "fulfilled" | "cancelled";
        fulfillment_method: "pickup" | "delivery";
        recipient_name: string;
        phone: string;
        delivery_address: string | null;
        redeemed_at: string;
        fulfilled_at: string | null;
        cancelled_at: string | null;
        reward_items: { name: string; point_cost: number } | null;
      }>;
    };
  }>("/rewards/wallet");
  return {
    balance: result.data.balance,
    transactions: result.data.transactions.map((item) => ({
      id: item.id,
      userId: "",
      amount: item.amount,
      type: item.transaction_type,
      reason: item.reason,
      refIncidentId: item.ref_incident_id ?? undefined,
      refRewardItemId: item.ref_reward_item_id ?? undefined,
      createdAt: item.created_at,
    })),
    redemptions: result.data.redemptions,
  };
}
export async function redeemReward(input: RewardRedemptionInput) {
  return apiFetch<{ data: { redemption_id: string; reward_item_id: string } }>(
    "/rewards/redemptions",
    { method: "POST", body: JSON.stringify(input) },
  );
}
export async function getAdminRewardRedemptions() {
  return (
    await apiFetch<{ data: AdminRewardRedemption[] }>(
      "/admin/reward-redemptions",
    )
  ).data;
}
export async function updateAdminRewardRedemption(input: {
  id: string;
  status: "fulfilled" | "cancelled";
  note?: string;
}) {
  return apiFetch<{ data: { id: string; status: string } }>(
    `/admin/reward-redemptions/${input.id}/status`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
}
