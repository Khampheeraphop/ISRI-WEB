import type { PointTransactionType } from "../../types/reward";

export const pointTransactionDetail: Record<
  PointTransactionType,
  { label: string; color: "success" | "primary" }
> = {
  earn: { label: "ได้รับแต้ม", color: "success" },
  redeem: { label: "ใช้แลก", color: "primary" },
};
