import {
  CardGiftcardOutlined,
  HistoryOutlined,
  RedeemOutlined,
} from "@mui/icons-material";
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
import { useState } from "react";
import { Link } from "react-router-dom";
import { GenericDataTable } from "../../components/GenericDataTable";
import { MainCard } from "../../components/base/MainCard";
import { useAuth } from "../../hooks/useAuth";
import {
  useEntityQuery,
  useRewardRedemptionMutation,
} from "../../hooks/useEntity";
import type { PointTransaction } from "../../types/reward";
import { formatBangkokDate } from "../../utils/incident";
import { pointTransactionDetail } from "./reward.constants";

const transactionColumns: GridColDef<PointTransaction>[] = [
  {
    field: "createdAt",
    headerName: "วันและเวลา",
    minWidth: 175,
    flex: 0.9,
    valueFormatter: (value) => formatBangkokDate(value),
  },
  { field: "reason", headerName: "รายการ", minWidth: 250, flex: 1.5 },
  {
    field: "type",
    headerName: "ประเภท",
    minWidth: 130,
    renderCell: ({ value }) => {
      const detail = pointTransactionDetail[value as PointTransaction["type"]];
      return (
        <Chip
          size="small"
          label={detail.label}
          color={detail.color}
          variant="outlined"
        />
      );
    },
  },
  {
    field: "amount",
    headerName: "แต้ม",
    minWidth: 100,
    align: "right",
    headerAlign: "right",
    renderCell: ({ value }) => (
      <Typography
        color={value > 0 ? "success.main" : "primary.main"}
        sx={{ fontWeight: 700 }}
      >
        {value > 0 ? "+" : ""}
        {value}
      </Typography>
    ),
  },
];

export function RewardWalletPage() {
  const { user } = useAuth();
  const wallets = useEntityQuery("pointWallets");
  const transactions = useEntityQuery("pointTransactions");
  const rewards = useEntityQuery("rewardItems");
  const fileStorages = useEntityQuery("fileStorages");
  const redemption = useRewardRedemptionMutation();
  const [feedback, setFeedback] = useState<{
    severity: "success" | "error";
    message: string;
  }>();
  if (!user) return null;
  const wallet = (wallets.data ?? []).find((item) => item.userId === user.id);
  const balance = wallet?.balance ?? 0;
  const transactionRows = (transactions.data ?? [])
    .filter((item) => item.userId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const availableRewards = (rewards.data ?? [])
    .filter((item) => item.isActive)
    .sort((a, b) => a.pointCost - b.pointCost);
  const storageById = new Map(
    (fileStorages.data ?? []).map((file) => [file.id, file]),
  );
  const standardRewards = availableRewards.filter(
    (reward) => reward.rewardPeriod === "standard",
  );
  const annualRewards = availableRewards.filter(
    (reward) => reward.rewardPeriod === "annual",
  );

  const handleRedeem = async (rewardItemId: string) => {
    try {
      await redemption.mutateAsync({ userId: user.id, rewardItemId });
      setFeedback({
        severity: "success",
        message: "บันทึกการแลกรางวัลแล้ว กรุณาติดต่อผู้ดูแลเพื่อรับของรางวัล",
      });
    } catch (error) {
      setFeedback({
        severity: "error",
        message:
          error instanceof Error ? error.message : "ไม่สามารถแลกรางวัลได้",
      });
    }
  };

  if (
    wallets.isLoading ||
    transactions.isLoading ||
    rewards.isLoading ||
    fileStorages.isLoading
  ) {
    return (
      <Box sx={{ minHeight: 320, display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3">แต้มและรางวัล</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          แต้มจะเพิ่มเมื่อรายการแจ้งซ่อมได้รับการยืนยันและดำเนินการเสร็จสิ้น
        </Typography>
      </Box>

      {feedback && (
        <Alert
          severity={feedback.severity}
          onClose={() => setFeedback(undefined)}
        >
          {feedback.message}
        </Alert>
      )}

      <MainCard
        sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}
        contentSx={{ p: { xs: 3, md: 4 } }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Box>
            <Typography sx={{ opacity: 0.82 }}>แต้มคงเหลือของคุณ</Typography>
            <Typography variant="h2" sx={{ mt: 0.25 }}>
              {balance.toLocaleString("th-TH")}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.82 }}>
              คะแนน
            </Typography>
          </Box>
          <CardGiftcardOutlined
            sx={{ fontSize: { xs: 56, sm: 70 }, opacity: 0.8 }}
          />
        </Stack>
      </MainCard>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "minmax(0, 1.4fr) minmax(340px, 0.8fr)",
          },
          gap: 3,
          alignItems: "start",
        }}
      >
        <MainCard
          title={<Typography variant="h5">รายการของรางวัล</Typography>}
          subheader="เลือกแลกด้วยแต้มคงเหลือในกระเป๋าของคุณ"
          contentSx={{ p: { xs: 2, md: 3 } }}
        >
          <Stack spacing={1.5}>
            <Typography variant="h6">รางวัลทั่วไป</Typography>
            {standardRewards.map((reward) => {
              const canRedeem = reward.stock > 0 && balance >= reward.pointCost;
              const image = reward.imageFileStorageId
                ? storageById.get(reward.imageFileStorageId)
                : undefined;
              return (
                <Box
                  key={reward.id}
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1.5,
                    display: "flex",
                    gap: 2,
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                >
                  <Box
                    component="img"
                    src={image?.publicUrl}
                    alt={reward.name}
                    sx={{
                      width: { xs: "100%", sm: 132 },
                      height: 132,
                      objectFit: "cover",
                      borderRadius: 1,
                      border: 1,
                      borderColor: "divider",
                      bgcolor: "background.default",
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">{reward.name}</Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.35 }}
                    >
                      {reward.description}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mt: 1, flexWrap: "wrap" }}
                    >
                      <Chip
                        size="small"
                        color="primary"
                        label={String(reward.pointCost) + " แต้ม"}
                      />
                      <Chip
                        size="small"
                        variant="outlined"
                        color={reward.stock ? "success" : "default"}
                        label={
                          reward.stock
                            ? "คงเหลือ " + reward.stock + " ชิ้น"
                            : "ของรางวัลหมด"
                        }
                      />
                    </Stack>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<RedeemOutlined />}
                    disabled={!canRedeem || redemption.isPending}
                    onClick={() => handleRedeem(reward.id)}
                  >
                    แลกรางวัล
                  </Button>
                </Box>
              );
            })}
            {!standardRewards.length && (
              <Typography color="text.secondary">
                ยังไม่มีของรางวัลที่เปิดให้แลกในขณะนี้
              </Typography>
            )}
            {!!annualRewards.length && (
              <>
                <Typography variant="h6" sx={{ pt: 2 }}>
                  รางวัลประจำปี
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  มอบให้ตามผลการจัดอันดับของแคมเปญ โดยไม่ตัดแต้มจากกระเป๋าถาวร
                </Typography>
              </>
            )}
            {annualRewards.map((reward) => {
              const image = reward.imageFileStorageId
                ? storageById.get(reward.imageFileStorageId)
                : undefined;
              return (
                <Box
                  key={reward.id}
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1.5,
                    display: "flex",
                    gap: 2,
                    alignItems: { xs: "flex-start", sm: "center" },
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                >
                  <Box
                    component="img"
                    src={image?.publicUrl}
                    alt={reward.name}
                    sx={{
                      width: { xs: "100%", sm: 132 },
                      height: 132,
                      objectFit: "cover",
                      borderRadius: 1,
                      border: 1,
                      borderColor: "divider",
                      bgcolor: "background.default",
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">{reward.name}</Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.35 }}
                    >
                      {reward.description}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Chip
                        size="small"
                        color="secondary"
                        label="รางวัลประจำปี"
                      />
                      <Chip
                        size="small"
                        variant="outlined"
                        label={String(reward.pointCost) + " แต้ม"}
                      />
                    </Stack>
                  </Box>
                  <Button component={Link} to="/campaigns" variant="outlined">
                    ดูอันดับแคมเปญ
                  </Button>
                </Box>
              );
            })}
          </Stack>
        </MainCard>

        <MainCard
          title={
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <HistoryOutlined color="primary" />
              <Typography variant="h5">สรุปการใช้งาน</Typography>
            </Stack>
          }
          contentSx={{ p: { xs: 2.5, md: 3 } }}
        >
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                ได้รับแต้มทั้งหมด
              </Typography>
              <Typography variant="h5" color="success.main">
                +
                {transactionRows
                  .filter((item) => item.amount > 0)
                  .reduce((total, item) => total + item.amount, 0)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                ใช้แลกของรางวัลแล้ว
              </Typography>
              <Typography variant="h5" color="primary.main">
                {transactionRows
                  .filter((item) => item.amount < 0)
                  .reduce((total, item) => total + item.amount, 0)}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              ตรวจสอบรายละเอียดรายการทั้งหมดได้จากตารางประวัติด้านล่าง
            </Typography>
          </Stack>
        </MainCard>
      </Box>

      <MainCard
        title={<Typography variant="h5">ประวัติแต้ม</Typography>}
        subheader="รายการได้รับและใช้แต้มล่าสุด"
      >
        <GenericDataTable
          rows={transactionRows}
          columns={transactionColumns}
          emptyMessage="ยังไม่มีประวัติแต้ม"
        />
      </MainCard>
    </Stack>
  );
}
