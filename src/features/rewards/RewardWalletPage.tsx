import {
  AccountBalanceWalletRounded,
  CardGiftcardOutlined,
  HistoryRounded,
  Inventory2Outlined,
  RedeemOutlined,
  StarsRounded,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { GenericDataTable } from "../../components/GenericDataTable";
import { MainCard } from "../../components/base/MainCard";
import { tableColumnAlignment } from "../../components/dataTable.constants";
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
    ...tableColumnAlignment.numeric,
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
  { field: "point_cost", headerName: "คะแนนที่ใช้", width: 120 },
  { field: "admin_note", headerName: "หมายเหตุผู้ดูแล", minWidth: 180 },
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
    ...tableColumnAlignment.center,
    valueGetter: (_value, row) =>
      row.fulfillment_method === "delivery" ? "จัดส่ง" : "รับด้วยตนเอง",
  },
  {
    field: "status",
    headerName: "สถานะ",
    width: 170,
    ...tableColumnAlignment.center,
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
              : row.status === "approved"
                ? "อนุมัติ รอส่งมอบ"
                : "รออนุมัติ"
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
  const [activeTab, setActiveTab] = useState(0);
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
    <Stack spacing={{ xs: 2, md: 2.5 }} sx={{ maxWidth: 1440, mx: "auto" }}>
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2.25, sm: 3 },
          overflow: "hidden",
          borderColor: "rgba(81,64,145,.16)",
          borderRadius: 2.5,
          background:
            "linear-gradient(120deg, rgba(81,64,145,.11), rgba(255,255,255,.98) 62%, rgba(244,236,252,.78))",
        }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <Box
            sx={{
              width: { xs: 48, sm: 56 },
              height: { xs: 48, sm: 56 },
              flex: "0 0 auto",
              display: "grid",
              placeItems: "center",
              borderRadius: 2,
              color: "#FFFFFF",
              bgcolor: "#514091",
              boxShadow: "0 10px 22px rgba(81,64,145,.22)",
              "& .MuiSvgIcon-root": { fontSize: { xs: 26, sm: 30 } },
            }}
          >
            <StarsRounded />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h3"
              sx={{ fontSize: { xs: "1.5rem", sm: "2rem" }, lineHeight: 1.25 }}
            >
              แต้มและรางวัล
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              สะสมแต้มจากการแจ้งเหตุ และเลือกแลกรางวัลที่คุณต้องการ
            </Typography>
          </Box>
        </Stack>
      </Paper>
      {(wallet.isError || catalog.isError) && (
        <Alert severity="error">ไม่สามารถโหลดข้อมูลรางวัลได้</Alert>
      )}
      {redeem.isSuccess && (
        <Alert severity="success">
          ส่งคำขอรับรางวัลแล้ว สามารถติดตามผลได้จากประวัติการรับรางวัล
        </Alert>
      )}
      <MainCard
        sx={{
          position: "relative",
          isolation: "isolate",
          overflow: "hidden",
          color: "#FFFFFF",
          border: 0,
          background: "linear-gradient(120deg, #4B3889 0%, #654FA5 58%, #7863B5 100%)",
          boxShadow: "0 14px 34px rgba(75,56,137,.2)",
          "&::before": {
            content: '\"\"',
            position: "absolute",
            zIndex: -1,
            width: 220,
            height: 220,
            right: -55,
            bottom: -135,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,.08)",
          },
        }}
        contentSx={{ p: { xs: 2.5, sm: 3.25 } }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Box>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
              <AccountBalanceWalletRounded sx={{ fontSize: 19, opacity: 0.82 }} />
              <Typography sx={{ color: "inherit", opacity: 0.86 }}>
                แต้มคงเหลือของคุณ
              </Typography>
            </Stack>
            <Typography
              sx={{
                mt: 0.75,
                color: "inherit",
                fontSize: { xs: "2.25rem", sm: "2.8rem" },
                fontWeight: 700,
                lineHeight: 1.05,
              }}
            >
              {balance.toLocaleString("th-TH")}
            </Typography>
            <Typography sx={{ color: "inherit", mt: 0.35, opacity: 0.8 }}>
              คะแนนสะสมที่พร้อมใช้
            </Typography>
          </Box>
          <Box
            sx={{
              width: { xs: 64, sm: 82 },
              height: { xs: 64, sm: 82 },
              flex: "0 0 auto",
              display: "grid",
              placeItems: "center",
              borderRadius: 2.5,
              bgcolor: "rgba(255,255,255,.12)",
              border: "1px solid rgba(255,255,255,.16)",
            }}
          >
            <CardGiftcardOutlined sx={{ fontSize: { xs: 38, sm: 48 }, opacity: 0.9 }} />
          </Box>
        </Stack>
      </MainCard>

      <Paper
        variant="outlined"
        sx={{
          overflow: "hidden",
          borderColor: "#DED6EA",
          borderRadius: 2.25,
          boxShadow: "0 7px 20px rgba(48,37,78,.045)",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, value: number) => setActiveTab(value)}
          variant="fullWidth"
          aria-label="เมนูแต้มและรางวัล"
          sx={{
            minHeight: 58,
            "& .MuiTab-root": {
              minHeight: 58,
              px: { xs: 1, sm: 2 },
              fontSize: { xs: ".74rem", sm: ".86rem" },
              fontWeight: 600,
            },
            "& .Mui-selected": { fontWeight: 700 },
            "& .MuiTabs-indicator": { height: 3, borderRadius: "3px 3px 0 0" },
          }}
        >
          <Tab
            id="rewards-tab-0"
            aria-controls="rewards-panel-0"
            icon={<CardGiftcardOutlined />}
            iconPosition="start"
            label="รางวัลที่แลกได้"
          />
          <Tab
            id="rewards-tab-1"
            aria-controls="rewards-panel-1"
            icon={<HistoryRounded />}
            iconPosition="start"
            label="ประวัติแต้ม"
          />
          <Tab
            id="rewards-tab-2"
            aria-controls="rewards-panel-2"
            icon={<RedeemOutlined />}
            iconPosition="start"
            label="ประวัติรับรางวัล"
          />
        </Tabs>
      </Paper>

      {activeTab === 0 && (
      <MainCard
        id="rewards-panel-0"
        role="tabpanel"
        aria-labelledby="rewards-tab-0"
        title={
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <CardGiftcardOutlined color="primary" />
            <Box>
              <Typography variant="h5">รางวัลที่แลกได้</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.15, fontSize: ".76rem" }}>
                เลือกรางวัลตามจำนวนแต้มและสต็อกที่มีอยู่
              </Typography>
            </Box>
          </Stack>
        }
        sx={{ borderRadius: 2.5 }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
            gap: 1.5,
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
                  gridTemplateColumns: { xs: "92px minmax(0, 1fr)", sm: "118px minmax(0, 1fr)" },
                  minHeight: { sm: 150 },
                  overflow: "hidden",
                  border: 1,
                  borderColor: enabled ? "#CEC3E3" : "divider",
                  borderRadius: 2,
                  bgcolor: "background.paper",
                  boxShadow: enabled
                    ? "0 7px 20px rgba(75,56,137,.07)"
                    : "none",
                  transition: "transform .15s ease, border-color .15s ease, box-shadow .15s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    borderColor: "#AD9CCF",
                    boxShadow: "0 10px 24px rgba(75,56,137,.1)",
                  },
                }}
              >
                <Box
                  sx={{
                    minHeight: { xs: 132, sm: 150 },
                    display: "grid",
                    placeItems: "center",
                    overflow: "hidden",
                    bgcolor: "#F4F1F8",
                    borderRight: 1,
                    borderColor: "divider",
                  }}
                >
                  {reward.imageUrl ? (
                    <Box
                      component="img"
                      src={reward.imageUrl}
                      alt={reward.name}
                      sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  ) : (
                    <Inventory2Outlined color="disabled" sx={{ fontSize: 38 }} />
                  )}
                </Box>
                <Stack spacing={0.75} sx={{ minWidth: 0, p: { xs: 1.25, sm: 1.75 } }}>
                  <Typography sx={{ fontWeight: 700, lineHeight: 1.35 }}>
                    {reward.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {reward.description}
                  </Typography>
                  <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", rowGap: 0.75 }}>
                    {reward.rewardPeriod === "standard" && (
                      <Chip
                        size="small"
                        color="primary"
                        icon={<StarsRounded />}
                        label={`${reward.pointCost.toLocaleString("th-TH")} แต้ม`}
                        sx={{ fontWeight: 700 }}
                      />
                    )}
                    <Chip
                      size="small"
                      variant="outlined"
                      icon={<Inventory2Outlined />}
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
                      sx={{ mt: "auto !important", alignSelf: "flex-start", borderRadius: 1.5 }}
                      startIcon={<RedeemOutlined />}
                      disabled={!enabled || redeem.isPending}
                      onClick={() => setSelectedReward(reward)}
                    >
                      แลกรางวัล
                    </Button>
                  )}
                </Stack>
              </Box>
            );
          })}
          {!rewards.length && (
            <Box
              sx={{
                gridColumn: "1 / -1",
                py: 6,
                display: "grid",
                placeItems: "center",
                textAlign: "center",
              }}
            >
              <Box>
                <CardGiftcardOutlined sx={{ fontSize: 42, color: "#9B90AE" }} />
                <Typography sx={{ mt: 1, fontWeight: 700 }}>ยังไม่มีรางวัลให้แลก</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.35 }}>
                  เมื่อมีรางวัลใหม่ รายการจะแสดงในส่วนนี้
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </MainCard>
      )}

      {activeTab === 1 && (
      <MainCard
        id="rewards-panel-1"
        role="tabpanel"
        aria-labelledby="rewards-tab-1"
        title={
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <HistoryRounded color="primary" />
            <Typography variant="h5">ประวัติแต้ม</Typography>
          </Stack>
        }
        sx={{ borderRadius: 2.5 }}
      >
        <GenericDataTable
          rows={wallet.data?.transactions ?? []}
          columns={columns}
          emptyMessage="ยังไม่มีประวัติแต้ม"
        />
      </MainCard>
      )}

      {activeTab === 2 && (
      <MainCard
        id="rewards-panel-2"
        role="tabpanel"
        aria-labelledby="rewards-tab-2"
        title={
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <RedeemOutlined color="primary" />
            <Typography variant="h5">ประวัติการรับรางวัล</Typography>
          </Stack>
        }
        sx={{ borderRadius: 2.5 }}
      >
        <GenericDataTable
          rows={wallet.data?.redemptions ?? []}
          columns={redemptionColumns}
          emptyMessage="ยังไม่มีคำขอรับรางวัล"
        />
      </MainCard>
      )}
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
