import {
  ArrowBackIosNewRounded,
  CardGiftcardOutlined,
  CloseRounded,
  HistoryRounded,
  Inventory2Outlined,
  RedeemOutlined,
  ShareRounded,
  StarsRounded,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import type { GridColDef } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedReward, setSelectedReward] = useState<Reward>();
  const [detailReward, setDetailReward] = useState<Reward>();
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
  const openRewardDetails = (reward: Reward) => {
    setDetailReward(reward);
  };
  const shareRewards = async () => {
    const shareData = {
      title: "แต้มและรางวัล ISRI",
      text: "ดูรางวัลจากคะแนนสะสมในระบบ ISRI",
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(shareData.url);
    } catch {
      // Closing the native share sheet is an expected no-op.
    }
  };
  return (
    <Stack
      spacing={{ xs: 0, sm: 2, md: 2.5 }}
      sx={{
        maxWidth: 1440,
        minHeight: { xs: "100dvh", sm: "auto" },
        mx: "auto",
        bgcolor: { xs: "#FFFFFF", sm: "transparent" },
      }}
    >
      <Paper
        component="header"
        square
        elevation={0}
        sx={{
          display: { xs: "block", sm: "none" },
          position: "sticky",
          top: 0,
          zIndex: 1000,
          border: 0,
          borderBottom: "1px solid #EEEAF4",
          bgcolor: "rgba(255,255,255,.96)",
          backdropFilter: "blur(14px)",
        }}
      >
        <Stack
          direction="row"
          sx={{
            minHeight: 68,
            px: 1.25,
            pt: "env(safe-area-inset-top)",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <IconButton aria-label="ย้อนกลับ" onClick={() => navigate(-1)}>
            <ArrowBackIosNewRounded />
          </IconButton>
          <Stack
            direction="row"
            spacing={0.75}
            sx={{ alignItems: "center", color: "#C87800" }}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                display: "grid",
                placeItems: "center",
                borderRadius: "50%",
                color: "#FFFFFF",
                background: "linear-gradient(145deg, #FFC640, #E99500)",
                boxShadow: "0 5px 14px rgba(229,154,27,.25)",
              }}
            >
              <StarsRounded sx={{ fontSize: 20 }} />
            </Box>
            <Typography
              sx={{ fontSize: "1.45rem", fontWeight: 700, lineHeight: 1 }}
            >
              {balance.toLocaleString("th-TH")}
            </Typography>
            <Typography sx={{ color: "text.primary", fontWeight: 600 }}>
              คะแนน
            </Typography>
          </Stack>
          <IconButton
            aria-label="แชร์หน้ารางวัล"
            onClick={() => void shareRewards()}
          >
            <ShareRounded />
          </IconButton>
        </Stack>
      </Paper>
      <Paper
        sx={{
          display: { xs: "none", sm: "block" },
          position: "relative",
          isolation: "isolate",
          overflow: "hidden",
          p: { xs: 2.5, sm: 3.5, lg: 4 },
          border: 0,
          borderRadius: { xs: 2.5, md: 3.5 },
          color: "common.white",
          background:
            "linear-gradient(125deg, #322365 0%, #514091 50%, #7961B7 100%)",
          boxShadow: "0 18px 46px rgba(53,38,109,.24)",
          "&::before": {
            content: '""',
            position: "absolute",
            zIndex: -1,
            width: { xs: 230, sm: 360 },
            height: { xs: 230, sm: 360 },
            right: { xs: -125, sm: -120 },
            top: { xs: -135, sm: -190 },
            borderRadius: "50%",
            border: "58px solid rgba(255,255,255,.065)",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            zIndex: -1,
            width: 190,
            height: 190,
            left: "44%",
            bottom: -150,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,.055)",
          },
        }}
      >
        <Stack
          direction="row"
          spacing={{ sm: 2.25, md: 3 }}
          sx={{
            alignItems: "center",
            justifyContent: "center",
            minHeight: { sm: 110, lg: 124 },
          }}
        >
          <Box
            sx={{
              width: { sm: 64, md: 76 },
              height: { sm: 64, md: 76 },
              flex: "0 0 auto",
              display: "grid",
              placeItems: "center",
              borderRadius: "50%",
              color: "#FFFFFF",
              bgcolor: "#E9A51B",
              boxShadow: "0 12px 30px rgba(28,17,70,.22)",
            }}
          >
            <StarsRounded sx={{ fontSize: { sm: 34, md: 40 } }} />
          </Box>
          <Box>
            <Typography
              sx={{ color: "rgba(255,255,255,.78)", fontWeight: 600 }}
            >
              คะแนนสะสมของคุณ
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "baseline", mt: 0.5 }}
            >
              <Typography
                component="h1"
                sx={{
                  color: "inherit",
                  fontSize: { sm: "3.2rem", lg: "3.8rem" },
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: "-.03em",
                }}
              >
                {balance.toLocaleString("th-TH")}
              </Typography>
              <Typography
                sx={{ color: "rgba(255,255,255,.86)", fontWeight: 600 }}
              >
                คะแนน
              </Typography>
            </Stack>
            <Typography
              sx={{
                mt: 0.75,
                color: "rgba(255,255,255,.7)",
                fontSize: ".86rem",
              }}
            >
              คะแนนที่พร้อมใช้แลกรางวัล
            </Typography>
          </Box>
        </Stack>
      </Paper>
      {(wallet.isError || catalog.isError) && (
        <Alert
          severity="error"
          sx={{ mx: { xs: 2, sm: 0 }, mt: { xs: 2, sm: 0 } }}
        >
          ไม่สามารถโหลดข้อมูลรางวัลได้
        </Alert>
      )}
      {redeem.isSuccess && (
        <Alert
          severity="success"
          sx={{ mx: { xs: 2, sm: 0 }, mt: { xs: 2, sm: 0 } }}
        >
          ส่งคำขอรับรางวัลแล้ว สามารถติดตามผลได้จากประวัติการรับรางวัล
        </Alert>
      )}
      <Paper
        variant="outlined"
        sx={{
          overflow: "hidden",
          borderColor: { xs: "#EEEAF4", sm: "#DED6EA" },
          borderWidth: { xs: "0 0 1px", sm: 1 },
          borderRadius: { xs: 0, sm: 2.25 },
          boxShadow: { xs: "none", sm: "0 7px 20px rgba(48,37,78,.045)" },
        }}
      >
        <Tabs
          value={isMobile ? (activeTab === 0 ? 0 : 1) : activeTab}
          onChange={(_, value: number) =>
            setActiveTab(isMobile ? (value === 0 ? 0 : 2) : value)
          }
          variant="fullWidth"
          aria-label="เมนูแต้มและรางวัล"
          sx={{
            minHeight: { xs: 56, sm: 58 },
            "& .MuiTab-root": {
              minHeight: { xs: 56, sm: 58 },
              px: { xs: 1, sm: 2 },
              fontSize: { xs: ".92rem", sm: ".86rem" },
              fontWeight: 700,
            },
            "& .Mui-selected": { fontWeight: 700 },
            "& .MuiTabs-indicator": {
              height: 4,
              borderRadius: "4px 4px 0 0",
              bgcolor: "#5A3E9E",
            },
          }}
        >
          <Tab
            id="rewards-tab-0"
            aria-controls="rewards-panel-0"
            icon={isMobile ? undefined : <CardGiftcardOutlined />}
            iconPosition="start"
            label="รางวัลที่แลกได้"
          />
          {isMobile ? (
            <Tab
              id="rewards-tab-history"
              aria-controls="rewards-panel-2"
              label="ประวัติการแลก"
            />
          ) : (
            [
              <Tab
                key="points-history"
                id="rewards-tab-1"
                aria-controls="rewards-panel-1"
                icon={<HistoryRounded />}
                iconPosition="start"
                label="ประวัติแต้ม"
              />,
              <Tab
                key="redemption-history"
                id="rewards-tab-2"
                aria-controls="rewards-panel-2"
                icon={<RedeemOutlined />}
                iconPosition="start"
                label="ประวัติรับรางวัล"
              />,
            ]
          )}
        </Tabs>
      </Paper>

      {isMobile && activeTab !== 0 && (
        <Stack
          direction="row"
          spacing={0.75}
          sx={{ px: 2, pt: 2, bgcolor: "#FFFFFF" }}
        >
          <Button
            fullWidth
            variant={activeTab === 2 ? "contained" : "text"}
            onClick={() => setActiveTab(2)}
            sx={{ borderRadius: 99 }}
          >
            การแลกรางวัล
          </Button>
          <Button
            fullWidth
            variant={activeTab === 1 ? "contained" : "text"}
            onClick={() => setActiveTab(1)}
            sx={{ borderRadius: 99 }}
          >
            คะแนนสะสม
          </Button>
        </Stack>
      )}

      {activeTab === 0 && (
        <MainCard
          id="rewards-panel-0"
          role="tabpanel"
          aria-labelledby="rewards-tab-0"
          title={
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <CardGiftcardOutlined color="primary" />
              <Box>
                <Typography variant="h5">
                  {isMobile ? "รางวัล" : "รางวัลที่แลกได้"}
                </Typography>
                <Typography
                  color="text.secondary"
                  sx={{
                    display: { xs: "none", sm: "block" },
                    mt: 0.15,
                    fontSize: ".76rem",
                  }}
                >
                  เลือกรางวัลตามจำนวนแต้มและสต็อกที่มีอยู่
                </Typography>
              </Box>
            </Stack>
          }
          sx={{
            border: { xs: 0, sm: 1 },
            borderRadius: { xs: 0, sm: 2.5 },
            overflow: "hidden",
            "& .MuiCardHeader-root": {
              px: { xs: 2, sm: 2.5 },
              py: { xs: 2, sm: 2.5 },
            },
            "& .MuiDivider-root": { display: { xs: "none", sm: "block" } },
          }}
          contentSx={{ p: { xs: "0 16px 24px", sm: 3 } }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, minmax(0, 1fr))",
                sm: "repeat(2, minmax(0, 1fr))",
                xl: "repeat(3, minmax(0, 1fr))",
              },
              gap: { xs: 1.25, sm: 2, lg: 2.5 },
            }}
          >
            {rewards.map((reward) => {
              const enabled =
                reward.rewardPeriod === "standard" &&
                reward.stock > 0 &&
                balance >= reward.pointCost;
              const progress =
                reward.rewardPeriod === "standard" && reward.pointCost > 0
                  ? Math.min(
                      100,
                      Math.max(0, (balance / reward.pointCost) * 100),
                    )
                  : 0;
              return (
                <Box
                  key={reward.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`ดูรายละเอียด ${reward.name}`}
                  onClick={() => openRewardDetails(reward)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openRewardDetails(reward);
                    }
                  }}
                  sx={{
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    cursor: "pointer",
                    border: 1,
                    borderColor: enabled ? "#CFC4E4" : "#E5DFEC",
                    borderRadius: { xs: 2.25, sm: 2.5 },
                    bgcolor: "background.paper",
                    boxShadow: enabled
                      ? {
                          xs: "0 7px 20px rgba(75,56,137,.08)",
                          sm: "0 10px 27px rgba(75,56,137,.1)",
                        }
                      : {
                          xs: "0 4px 14px rgba(55,44,82,.04)",
                          sm: "0 5px 16px rgba(55,44,82,.045)",
                        },
                    transition:
                      "transform .15s ease, border-color .15s ease, box-shadow .15s ease",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      borderColor: "#AD9CCF",
                      boxShadow: "0 15px 32px rgba(75,56,137,.13)",
                    },
                    "&:focus-visible": {
                      outline: "3px solid rgba(81,64,145,.3)",
                      outlineOffset: 3,
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      aspectRatio: "1 / 1",
                      display: "grid",
                      placeItems: "center",
                      overflow: "hidden",
                      bgcolor: "#F8F6FB",
                      "&:hover .reward-image": { transform: "scale(1.025)" },
                    }}
                  >
                    {reward.imageUrl ? (
                      <Box
                        component="img"
                        className="reward-image"
                        src={reward.imageUrl}
                        alt={reward.name}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          objectPosition: "center",
                          display: "block",
                          transition: "transform .25s ease",
                        }}
                      />
                    ) : (
                      <CardGiftcardOutlined
                        color="disabled"
                        sx={{ fontSize: 52 }}
                      />
                    )}
                    <Chip
                      size="small"
                      icon={<Inventory2Outlined />}
                      label={`จำนวนคงเหลือ ${reward.stock}`}
                      sx={{
                        position: "absolute",
                        top: { xs: 7, sm: 12 },
                        right: { xs: 7, sm: 12 },
                        height: { xs: 25, sm: 30 },
                        maxWidth: { xs: "calc(100% - 14px)", sm: "none" },
                        fontWeight: 700,
                        fontSize: { xs: ".66rem", sm: ".8125rem" },
                        color: reward.stock > 0 ? "#3A3152" : "text.disabled",
                        bgcolor: "rgba(255,255,255,.93)",
                        boxShadow: "0 4px 14px rgba(37,27,66,.14)",
                        "& .MuiChip-icon": {
                          display: { xs: "none", sm: "block" },
                          color: reward.stock > 0 ? "#514091" : "text.disabled",
                        },
                      }}
                    />
                  </Box>
                  <Stack
                    spacing={{ xs: 0.7, sm: 1 }}
                    sx={{ minWidth: 0, flex: 1, p: { xs: 1.15, sm: 2 } }}
                  >
                    {reward.rewardPeriod === "annual" && (
                      <Typography
                        sx={{
                          color: "#765BB3",
                          fontSize: ".74rem",
                          fontWeight: 700,
                          letterSpacing: ".03em",
                        }}
                      >
                        รางวัลประจำปี
                      </Typography>
                    )}
                    <Typography
                      sx={{
                        display: "-webkit-box",
                        minHeight: { xs: "2.75em", sm: "auto" },
                        overflow: "hidden",
                        fontSize: { xs: ".88rem", sm: "1.05rem" },
                        fontWeight: 700,
                        lineHeight: 1.38,
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2,
                      }}
                    >
                      {reward.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: { xs: "none", sm: "-webkit-box" },
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        minHeight: "2.9em",
                      }}
                    >
                      {reward.description}
                    </Typography>
                    {reward.rewardPeriod === "standard" && (
                      <Box sx={{ mt: "auto !important", pt: 0.5 }}>
                        <Stack
                          direction="row"
                          sx={{
                            alignItems: "baseline",
                            justifyContent: "space-between",
                            gap: 0.5,
                            mb: { xs: 0.9, sm: 1.25 },
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={0.6}
                            sx={{ alignItems: "center" }}
                          >
                            <StarsRounded
                              sx={{
                                color: "#E59A1B",
                                fontSize: { xs: 18, sm: 21 },
                              }}
                            />
                            <Typography
                              sx={{
                                color: "#C77A00",
                                fontSize: { xs: "1.12rem", sm: "1.42rem" },
                                fontWeight: 700,
                                lineHeight: 1,
                              }}
                            >
                              {reward.pointCost.toLocaleString("th-TH")}
                            </Typography>
                            <Typography
                              color="text.secondary"
                              sx={{ fontSize: { xs: ".7rem", sm: ".82rem" } }}
                            >
                              คะแนน
                            </Typography>
                          </Stack>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={progress}
                          aria-label={`สะสมคะแนนได้ ${Math.round(progress)} เปอร์เซ็นต์`}
                          sx={{
                            height: { xs: 6, sm: 8 },
                            mb: 0.75,
                            borderRadius: 99,
                            bgcolor: "#ECE9F0",
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 99,
                              bgcolor: enabled ? "#4CAF50" : "#E59A1B",
                            },
                          }}
                        />
                        <Stack
                          direction="row"
                          sx={{
                            display: { xs: "none", sm: "flex" },
                            justifyContent: "space-between",
                            gap: 1,
                            mb: 1.25,
                          }}
                        >
                          <Typography
                            color="text.secondary"
                            sx={{ fontSize: ".72rem" }}
                          >
                            มี {balance.toLocaleString("th-TH")} คะแนน
                          </Typography>
                          <Typography
                            sx={{
                              color: enabled ? "success.main" : "#A86500",
                              fontSize: ".72rem",
                              fontWeight: 700,
                            }}
                          >
                            {enabled
                              ? "พร้อมแลกแล้ว"
                              : reward.stock <= 0
                                ? "ของรางวัลหมด"
                                : `ขาดอีก ${(reward.pointCost - balance).toLocaleString("th-TH")} คะแนน`}
                          </Typography>
                        </Stack>
                        <Button
                          fullWidth
                          variant={enabled ? "contained" : "outlined"}
                          sx={{
                            display: { xs: "none", sm: "flex" },
                            minHeight: { xs: 36, sm: 42 },
                            px: { xs: 0.75, sm: 2 },
                            borderRadius: { xs: 1.5, sm: 1.75 },
                            fontSize: { xs: ".74rem", sm: ".95rem" },
                            "& .MuiButton-startIcon": {
                              display: { xs: "none", sm: "inherit" },
                            },
                          }}
                          startIcon={<RedeemOutlined />}
                          disabled={!enabled || redeem.isPending}
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedReward(reward);
                          }}
                        >
                          {reward.stock <= 0
                            ? "ของรางวัลหมด"
                            : balance < reward.pointCost
                              ? isMobile
                                ? "คะแนนไม่พอ"
                                : "คะแนนยังไม่เพียงพอ"
                              : "แลกรางวัล"}
                        </Button>
                      </Box>
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
                  <CardGiftcardOutlined
                    sx={{ fontSize: 42, color: "#9B90AE" }}
                  />
                  <Typography sx={{ mt: 1, fontWeight: 700 }}>
                    ยังไม่มีรางวัลให้แลก
                  </Typography>
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
      <Dialog
        open={Boolean(detailReward)}
        onClose={() => setDetailReward(undefined)}
        fullWidth
        maxWidth="lg"
        slotProps={{
          paper: {
            sx: {
              width: {
                xs: "calc(100% - 24px)",
                sm: "calc(100% - 64px)",
                md: "min(1120px, calc(100% - 64px))",
              },
              height: { md: "min(720px, calc(100dvh - 64px))" },
              maxHeight: "calc(100dvh - 32px)",
              m: { xs: 1.5, sm: 4 },
              overflow: "hidden",
              borderRadius: { xs: 2.5, sm: 3 },
              boxShadow: "0 26px 80px rgba(32,22,68,.24)",
            },
          },
        }}
      >
        {detailReward &&
          (() => {
            const detailEnabled =
              detailReward.rewardPeriod === "standard" &&
              detailReward.stock > 0 &&
              balance >= detailReward.pointCost;
            const detailProgress =
              detailReward.rewardPeriod === "standard" &&
              detailReward.pointCost > 0
                ? Math.min(
                    100,
                    Math.max(0, (balance / detailReward.pointCost) * 100),
                  )
                : 0;
            return (
              <DialogContent
                sx={{
                  position: "relative",
                  display: { md: "grid" },
                  gridTemplateColumns: {
                    md: "minmax(0, 1.08fr) minmax(390px, .92fr)",
                  },
                  minHeight: 0,
                  p: 0,
                  overflow: { xs: "auto", md: "hidden" },
                }}
              >
                <IconButton
                  aria-label="ปิดรายละเอียด"
                  onClick={() => setDetailReward(undefined)}
                  sx={{
                    position: "absolute",
                    zIndex: 3,
                    top: { xs: 12, md: 16 },
                    right: { xs: 12, md: 16 },
                    bgcolor: "rgba(255,255,255,.96)",
                    boxShadow: "0 5px 18px rgba(37,27,66,.15)",
                    "&:hover": { bgcolor: "#FFFFFF" },
                  }}
                >
                  <CloseRounded />
                </IconButton>
                <Box
                  sx={{
                    position: "relative",
                    minHeight: { xs: 280, sm: 360, md: 0 },
                    display: "grid",
                    placeItems: "center",
                    overflow: "hidden",
                    p: { xs: 0, md: 3 },
                    bgcolor: "#F7F5FA",
                    borderRight: { md: "1px solid #E7E1EF" },
                  }}
                >
                  {detailReward.imageUrl ? (
                    <Box
                      component="img"
                      src={detailReward.imageUrl}
                      alt={detailReward.name}
                      sx={{
                        width: "100%",
                        height: "100%",
                        maxHeight: { xs: 360, md: "100%" },
                        objectFit: "contain",
                        objectPosition: "center",
                        display: "block",
                      }}
                    />
                  ) : (
                    <CardGiftcardOutlined
                      color="disabled"
                      sx={{ fontSize: 72 }}
                    />
                  )}
                </Box>
                <Box
                  sx={{
                    minWidth: 0,
                    minHeight: 0,
                    display: "flex",
                    flexDirection: "column",
                    bgcolor: "#FFFFFF",
                  }}
                >
                  <Box
                    sx={{
                      minHeight: 0,
                      flex: 1,
                      overflowY: { md: "auto" },
                      p: { xs: 2.25, sm: 3.5, md: 4 },
                      pr: { md: 4.5 },
                    }}
                  >
                    <Stack
                      direction={{ xs: "column", sm: "row", md: "column" }}
                      spacing={1.5}
                      sx={{
                        pr: { xs: 5, md: 4 },
                        justifyContent: "space-between",
                        alignItems: {
                          xs: "flex-start",
                          sm: "center",
                          md: "flex-start",
                        },
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        {detailReward.rewardPeriod === "annual" && (
                          <Typography
                            sx={{
                              color: "primary.main",
                              fontSize: ".78rem",
                              fontWeight: 700,
                            }}
                          >
                            รางวัลประจำปี
                          </Typography>
                        )}
                        <Typography
                          component="h2"
                          sx={{
                            mt: 0.25,
                            fontSize: {
                              xs: "1.35rem",
                              sm: "1.65rem",
                              md: "1.8rem",
                            },
                            fontWeight: 700,
                            lineHeight: 1.45,
                          }}
                        >
                          {detailReward.name}
                        </Typography>
                      </Box>
                      <Chip
                        icon={<Inventory2Outlined />}
                        label={`จำนวนคงเหลือ ${detailReward.stock} ชิ้น`}
                        color={detailReward.stock > 0 ? "primary" : "default"}
                        variant="outlined"
                        sx={{ flex: "0 0 auto", fontWeight: 700 }}
                      />
                    </Stack>

                    {detailReward.rewardPeriod === "standard" && (
                      <Box
                        sx={{
                          mt: 2.5,
                          overflow: "hidden",
                          borderRadius: 2.25,
                          bgcolor: "#F8F6FB",
                          border: "1px solid #E6DFEF",
                        }}
                      >
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                          }}
                        >
                          <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
                            <Typography
                              color="text.secondary"
                              sx={{ fontSize: ".8rem" }}
                            >
                              ใช้คะแนน
                            </Typography>
                            <Stack
                              direction="row"
                              spacing={0.65}
                              sx={{ mt: 0.5, alignItems: "center" }}
                            >
                              <StarsRounded
                                sx={{ color: "#E59A1B", fontSize: 22 }}
                              />
                              <Typography
                                sx={{
                                  color: "#C77A00",
                                  fontSize: "1.65rem",
                                  fontWeight: 700,
                                  lineHeight: 1,
                                }}
                              >
                                {detailReward.pointCost.toLocaleString("th-TH")}
                              </Typography>
                              <Typography
                                color="text.secondary"
                                sx={{ fontSize: ".78rem" }}
                              >
                                คะแนน
                              </Typography>
                            </Stack>
                          </Box>
                          <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
                            <Typography
                              color="text.secondary"
                              sx={{ fontSize: ".8rem" }}
                            >
                              คะแนนของคุณ
                            </Typography>
                            <Typography
                              sx={{
                                mt: 0.5,
                                color: "primary.main",
                                fontSize: "1.65rem",
                                fontWeight: 700,
                                lineHeight: 1,
                              }}
                            >
                              {balance.toLocaleString("th-TH")}{" "}
                              <Typography
                                component="span"
                                color="text.secondary"
                                sx={{ fontSize: ".78rem" }}
                              >
                                คะแนน
                              </Typography>
                            </Typography>
                          </Box>
                        </Box>
                        <Box
                          sx={{
                            px: { xs: 1.5, sm: 2 },
                            pb: { xs: 1.5, sm: 2 },
                          }}
                        >
                          <LinearProgress
                            variant="determinate"
                            value={detailProgress}
                            aria-label={`สะสมคะแนนได้ ${Math.round(detailProgress)} เปอร์เซ็นต์`}
                            sx={{
                              mt: 0.8,
                              height: 9,
                              borderRadius: 99,
                              bgcolor: "#E6E1EA",
                              "& .MuiLinearProgress-bar": {
                                borderRadius: 99,
                                bgcolor: detailEnabled ? "#4B3B86" : "#E59A1B",
                              },
                            }}
                          />
                          <Typography
                            sx={{
                              mt: 0.8,
                              color: detailEnabled ? "success.main" : "#A86500",
                              fontSize: ".78rem",
                              fontWeight: 700,
                              textAlign: "right",
                            }}
                          >
                            {detailEnabled
                              ? ""
                              : detailReward.stock <= 0
                                ? "ของรางวัลหมด"
                                : `ขาดอีก ${(detailReward.pointCost - balance).toLocaleString("th-TH")} คะแนน`}
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    <Box
                      sx={{
                        mt: 3,
                        pt: 2.5,
                        borderTop: 1,
                        borderColor: "divider",
                      }}
                    >
                      <Typography sx={{ fontSize: "1.05rem", fontWeight: 700 }}>
                        รายละเอียดรางวัล
                      </Typography>
                      <Typography
                        color="text.secondary"
                        sx={{
                          mt: 0.85,
                          whiteSpace: "pre-line",
                          lineHeight: 1.8,
                        }}
                      >
                        {detailReward.description || "ไม่มีรายละเอียดเพิ่มเติม"}
                      </Typography>
                    </Box>
                  </Box>

                  {detailReward.rewardPeriod === "standard" && (
                    <Box
                      sx={{
                        p: { xs: 2.25, sm: 3, md: "20px 32px 24px" },
                        borderTop: 1,
                        borderColor: "divider",
                        bgcolor: "rgba(255,255,255,.98)",
                      }}
                    >
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={
                          detailEnabled ? <RedeemOutlined /> : undefined
                        }
                        disabled={!detailEnabled || redeem.isPending}
                        onClick={() => {
                          setSelectedReward(detailReward);
                          setDetailReward(undefined);
                        }}
                        sx={{ minHeight: 50, borderRadius: 2, fontWeight: 700 }}
                      >
                        {detailReward.stock <= 0
                          ? "ของรางวัลหมด"
                          : balance < detailReward.pointCost
                            ? "คุณมีคะแนนไม่เพียงพอ"
                            : `แลกของรางวัล ${detailReward.pointCost.toLocaleString("th-TH")} คะแนน`}
                      </Button>
                    </Box>
                  )}
                </Box>
              </DialogContent>
            );
          })()}
      </Dialog>
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
