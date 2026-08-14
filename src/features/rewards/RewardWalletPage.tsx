import { CardGiftcardOutlined, RedeemOutlined } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { GenericDataTable } from "../../components/GenericDataTable";
import { MainCard } from "../../components/base/MainCard";
import { useAuth } from "../../hooks/useAuth";
import type { PointTransaction } from "../../types/reward";
import {
  getRewardCatalog,
  getRewardWallet,
  redeemReward,
  type Reward,
} from "./rewardsApi";
import { RewardRedemptionDialog } from "./RewardRedemptionDialog";

const columns: GridColDef<PointTransaction>[] = [
  { field: "reason", headerName: "รายการ", minWidth: 240, flex: 1 },
  {
    field: "amount",
    headerName: "แต้ม",
    width: 110,
    valueFormatter: (value: number) =>
      `${value > 0 ? "+" : ""}${value.toLocaleString("th-TH")}`,
  },
  {
    field: "createdAt",
    headerName: "วันที่",
    minWidth: 180,
    valueFormatter: (value: string) =>
      new Date(value).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }),
  },
];

type WalletRedemption = Awaited<
  ReturnType<typeof getRewardWallet>
>["redemptions"][number];
const redemptionColumns: GridColDef<WalletRedemption>[] = [
  {
    field: "reward",
    headerName: "รางวัล",
    minWidth: 200,
    flex: 1,
    valueGetter: (_value, row) => row.reward_items?.name ?? "–",
  },
  {
    field: "fulfillment_method",
    headerName: "วิธีรับ",
    width: 130,
    valueGetter: (_value, row) =>
      row.fulfillment_method === "delivery" ? "จัดส่ง" : "รับด้วยตนเอง",
  },
  {
    field: "status",
    headerName: "สถานะ",
    width: 140,
    renderCell: ({ row }) => (
      <Chip
        size="small"
        variant="outlined"
        color={
          row.status === "fulfilled"
            ? "success"
            : row.status === "cancelled"
              ? "default"
              : "warning"
        }
        label={
          row.status === "fulfilled"
            ? "ส่งมอบแล้ว"
            : row.status === "cancelled"
              ? "ยกเลิกและคืนแต้ม"
              : "รอดำเนินการ"
        }
      />
    ),
  },
  {
    field: "redeemed_at",
    headerName: "วันที่แลก",
    minWidth: 180,
    valueFormatter: (value: string) =>
      new Date(value).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }),
  },
];

export function RewardWalletPage() {
  const client = useQueryClient();
  const { user } = useAuth();
  const [selectedReward, setSelectedReward] = useState<Reward>();
  const wallet = useQuery({
    queryKey: ["reward-wallet"],
    queryFn: getRewardWallet,
  });
  const catalog = useQuery({
    queryKey: ["reward-catalog"],
    queryFn: getRewardCatalog,
  });
  const redeem = useMutation({
    mutationFn: redeemReward,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ["reward-wallet"] }),
        client.invalidateQueries({ queryKey: ["reward-catalog"] }),
      ]);
      setSelectedReward(undefined);
    },
  });
  if (wallet.isLoading || catalog.isLoading)
    return (
      <Box sx={{ minHeight: 320, display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  const balance = wallet.data?.balance ?? 0;
  const rewards = catalog.data ?? [];
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3">แต้มและรางวัล</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          แต้มจะได้รับเมื่อผู้จัดสรรตรวจสอบระดับความเร่งด่วนและอนุมัติปิดงานแล้ว
        </Typography>
      </Box>
      {(wallet.isError || catalog.isError) && (
        <Alert severity="error">ไม่สามารถโหลดข้อมูลรางวัลได้</Alert>
      )}
      {redeem.isSuccess && (
        <Alert severity="success">
          ส่งคำขอรับรางวัลแล้ว สามารถติดตามผลได้จากประวัติการรับรางวัล
        </Alert>
      )}
      <MainCard
        sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}
        contentSx={{ p: 3 }}
      >
        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Box>
            <Typography sx={{ opacity: 0.82 }}>แต้มคงเหลือของคุณ</Typography>
            <Typography variant="h2">
              {balance.toLocaleString("th-TH")}
            </Typography>
            <Typography sx={{ opacity: 0.82 }}>คะแนน</Typography>
          </Box>
          <CardGiftcardOutlined sx={{ fontSize: 68, opacity: 0.8 }} />
        </Stack>
      </MainCard>
      <MainCard title={<Typography variant="h5">รายการของรางวัล</Typography>}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
            gap: 2,
          }}
        >
          {rewards.map((reward) => {
            const enabled =
              reward.rewardPeriod === "standard" &&
              reward.stock > 0 &&
              balance >= reward.pointCost;
            return (
              <Box
                key={reward.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "96px minmax(0, 1fr)",
                  gap: 1.5,
                  p: 1.5,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1.5,
                }}
              >
                <Box
                  component="img"
                  src={reward.imageUrl ?? undefined}
                  alt={reward.name}
                  sx={{
                    width: 96,
                    height: 96,
                    borderRadius: 1,
                    objectFit: "cover",
                    bgcolor: "background.default",
                  }}
                />
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>
                    {reward.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {reward.description}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip
                      size="small"
                      color="primary"
                      label={`${reward.pointCost} แต้ม`}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      label={
                        reward.rewardPeriod === "annual"
                          ? "รางวัลประจำปี"
                          : `เหลือ ${reward.stock}`
                      }
                    />
                  </Stack>
                  {reward.rewardPeriod === "standard" && (
                    <Button
                      size="small"
                      variant="contained"
                      sx={{ mt: 1 }}
                      startIcon={<RedeemOutlined />}
                      disabled={!enabled || redeem.isPending}
                      onClick={() => setSelectedReward(reward)}
                    >
                      แลกรางวัล
                    </Button>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </MainCard>
      <MainCard title={<Typography variant="h5">ประวัติแต้ม</Typography>}>
        <GenericDataTable
          rows={wallet.data?.transactions ?? []}
          columns={columns}
          emptyMessage="ยังไม่มีประวัติแต้ม"
        />
      </MainCard>
      <MainCard
        title={<Typography variant="h5">ประวัติการรับรางวัล</Typography>}
      >
        <GenericDataTable
          rows={wallet.data?.redemptions ?? []}
          columns={redemptionColumns}
          emptyMessage="ยังไม่มีคำขอรับรางวัล"
        />
      </MainCard>
      <RewardRedemptionDialog
        reward={selectedReward}
        defaultRecipientName={user?.name ?? ""}
        submitting={redeem.isPending}
        error={redeem.error}
        onClose={() => setSelectedReward(undefined)}
        onSubmit={(input) => redeem.mutate(input)}
      />
    </Stack>
  );
}
