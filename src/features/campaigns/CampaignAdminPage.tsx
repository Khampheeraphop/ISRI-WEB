import {
  AddOutlined,
  CalendarMonthOutlined,
  CampaignRounded,
  CancelOutlined,
  CardGiftcardOutlined,
  CheckCircleOutlined,
  EmojiEventsOutlined,
  HourglassBottomRounded,
  Inventory2Outlined,
  LockOutlined,
  SearchRounded,
  TaskAltRounded,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { MainCard } from "../../components/base/MainCard";
import { ActionDialog } from "../../components/feedback/ActionDialog";
import type { CampaignAward, RewardCampaign } from "../../types/reward";
import {
  campaignPeriodLabel,
  campaignStatusLabel,
  formatCampaignPeriod,
} from "./campaign.constants";
import {
  closeCampaign,
  getCampaigns,
  updateCampaignAward,
} from "./campaignApi";

const awardStatus = {
  pending: { label: "รอส่งมอบ", color: "warning" as const },
  fulfilled: { label: "ส่งมอบแล้ว", color: "success" as const },
  cancelled: { label: "ยกเลิกแล้ว", color: "default" as const },
};

type AwardAction = {
  campaign: RewardCampaign;
  award: CampaignAward;
  status: "fulfilled" | "cancelled";
};

function CampaignListCard({
  campaign,
  onClose,
  onAwardAction,
}: {
  campaign: RewardCampaign;
  onClose: (campaign: RewardCampaign) => void;
  onAwardAction: (action: AwardAction) => void;
}) {
  const isActive = campaign.status === "active";
  return (
    <MainCard
      title={<Typography variant="h5">{campaign.name}</Typography>}
      subheader={campaignPeriodLabel[campaign.periodType]}
      sx={{
        overflow: "hidden",
        borderTop: `4px solid ${isActive ? "#3A8B69" : "#81778E"}`,
        boxShadow: "0 8px 26px rgba(48,37,78,.055)",
      }}
      action={
        <Chip
          size="small"
          color={isActive ? "success" : "default"}
          variant="outlined"
          label={campaignStatusLabel[campaign.status]}
        />
      }
      footer={
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ width: "100%", justifyContent: "flex-end" }}
        >
          <Button
            component={Link}
            to={`/campaigns?campaign=${campaign.id}`}
            variant="contained"
            startIcon={<EmojiEventsOutlined />}
          >
            ดูอันดับ
          </Button>
          <Button
            component={Link}
            to={`/campaigns/manage/${campaign.id}`}
            variant="outlined"
            disabled={!isActive}
          >
            แก้ไขแคมเปญ
          </Button>
          {isActive && (
            <Button
              color="warning"
              startIcon={<LockOutlined />}
              onClick={() => onClose(campaign)}
            >
              ปิดรอบและล็อกอันดับ
            </Button>
          )}
        </Stack>
      }
    >
      <Stack spacing={2.5}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2.25}
          sx={{ alignItems: { sm: "center" } }}
        >
          <Box
            sx={{
              width: { xs: "100%", sm: 168 },
              height: 126,
              flexShrink: 0,
              display: "grid",
              placeItems: "center",
              bgcolor: "background.default",
              borderRadius: 2,
              overflow: "hidden",
              border: 1,
              borderColor: "divider",
            }}
          >
            {campaign.reward?.imageUrl ? (
              <Box
                component="img"
                src={campaign.reward.imageUrl}
                alt={campaign.reward.name}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <Inventory2Outlined color="disabled" sx={{ fontSize: 46 }} />
            )}
          </Box>
          <Stack spacing={1.25} sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <CalendarMonthOutlined color="primary" fontSize="small" />
              <Typography>
                {formatCampaignPeriod(campaign.startDate, campaign.endDate)}
              </Typography>
            </Stack>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "flex-start" }}
            >
              <CardGiftcardOutlined
                color="primary"
                fontSize="small"
                sx={{ mt: 0.25 }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" color="text.secondary">
                  รางวัลสำหรับผู้ชนะ
                </Typography>
                <Typography sx={{ fontWeight: 700 }}>
                  {campaign.reward?.name ?? campaign.prizeDescription}
                </Typography>
                {campaign.reward?.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.25 }}
                  >
                    {campaign.reward.description}
                  </Typography>
                )}
              </Box>
            </Stack>
            <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap" }}>
              <Chip size="small" label={`ผู้ชนะ ${campaign.winnerCount} คน`} />
              {isActive && campaign.rewardItemId && (
                <Chip
                  size="small"
                  color="secondary"
                  variant="outlined"
                  label={`สำรองแล้ว ${campaign.reservedRewardCount} ชิ้น`}
                />
              )}
            </Stack>
          </Stack>
        </Stack>

        {!isActive && (
          <>
            <Divider />
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, mb: 1.25 }}
              >
                การส่งมอบรางวัล
              </Typography>
              {!campaign.awards.length ? (
                <Alert severity="info">
                  รอบนี้ไม่มีผู้ได้รับคะแนน จึงไม่มีรายการส่งมอบ
                </Alert>
              ) : (
                <Stack spacing={1}>
                  {campaign.awards.map((award) => (
                    <Stack
                      key={award.id}
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1.25}
                      sx={{
                        p: 1.5,
                        alignItems: { sm: "center" },
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 1.5,
                      }}
                    >
                      <Avatar
                        sx={{ width: 38, height: 38, bgcolor: "primary.main" }}
                      >
                        {award.rank}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700 }}>
                          {award.winnerName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          อันดับ {award.rank} ·{" "}
                          {campaign.reward?.name ?? campaign.prizeDescription}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        color={awardStatus[award.status].color}
                        label={awardStatus[award.status].label}
                      />
                      {award.status === "pending" && (
                        <Stack direction="row" spacing={0.75}>
                          <Button
                            size="small"
                            color="success"
                            startIcon={<CheckCircleOutlined />}
                            onClick={() =>
                              onAwardAction({
                                campaign,
                                award,
                                status: "fulfilled",
                              })
                            }
                          >
                            ส่งมอบแล้ว
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<CancelOutlined />}
                            onClick={() =>
                              onAwardAction({
                                campaign,
                                award,
                                status: "cancelled",
                              })
                            }
                          >
                            ยกเลิก
                          </Button>
                        </Stack>
                      )}
                    </Stack>
                  ))}
                </Stack>
              )}
            </Box>
          </>
        )}
      </Stack>
    </MainCard>
  );
}

export function CampaignAdminPage() {
  const queryClient = useQueryClient();
  const campaigns = useQuery({
    queryKey: ["campaigns"],
    queryFn: getCampaigns,
  });
  const [closeTarget, setCloseTarget] = useState<RewardCampaign>();
  const [awardAction, setAwardAction] = useState<AwardAction>();
  const [awardNote, setAwardNote] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "ended">(
    "all",
  );
  const [feedback, setFeedback] = useState<{
    severity: "success" | "error";
    text: string;
  }>();

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["campaigns"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-rewards"] }),
    ]);
  };
  const close = useMutation({
    mutationFn: closeCampaign,
    onSuccess: async () => {
      await refresh();
      setCloseTarget(undefined);
      setFeedback({
        severity: "success",
        text: "ปิดรอบและสร้างรายการส่งมอบรางวัลแล้ว",
      });
    },
    onError: (cause) =>
      setFeedback({
        severity: "error",
        text:
          cause instanceof Error ? cause.message : "ไม่สามารถปิดรอบแคมเปญได้",
      }),
  });
  const updateAward = useMutation({
    mutationFn: updateCampaignAward,
    onSuccess: async () => {
      await refresh();
      setAwardAction(undefined);
      setAwardNote("");
      setFeedback({
        severity: "success",
        text: "บันทึกสถานะรางวัลเรียบร้อยแล้ว",
      });
    },
    onError: (cause) =>
      setFeedback({
        severity: "error",
        text:
          cause instanceof Error
            ? cause.message
            : "ไม่สามารถบันทึกสถานะรางวัลได้",
      }),
  });

  const allCampaigns = campaigns.data ?? [];
  const filteredCampaigns = allCampaigns.filter((campaign) => {
    const keyword = search.trim().toLocaleLowerCase("th-TH");
    const matchesStatus =
      statusFilter === "all" || campaign.status === statusFilter;
    const matchesSearch =
      !keyword ||
      campaign.name.toLocaleLowerCase("th-TH").includes(keyword) ||
      (campaign.reward?.name ?? campaign.prizeDescription)
        .toLocaleLowerCase("th-TH")
        .includes(keyword);
    return matchesStatus && matchesSearch;
  });
  const pendingAwards = allCampaigns.reduce(
    (total, campaign) =>
      total + campaign.awards.filter((award) => award.status === "pending").length,
    0,
  );
  const summary = [
    {
      label: "แคมเปญทั้งหมด",
      value: allCampaigns.length,
      color: "#514091",
      background: "#F0ECFA",
      icon: <CampaignRounded />,
    },
    {
      label: "กำลังดำเนินการ",
      value: allCampaigns.filter((campaign) => campaign.status === "active").length,
      color: "#287357",
      background: "#EAF7F1",
      icon: <EmojiEventsOutlined />,
    },
    {
      label: "ปิดรอบแล้ว",
      value: allCampaigns.filter((campaign) => campaign.status === "ended").length,
      color: "#52677A",
      background: "#EDF2F5",
      icon: <TaskAltRounded />,
    },
    {
      label: "รอส่งมอบรางวัล",
      value: pendingAwards,
      color: "#A56312",
      background: "#FFF5E7",
      icon: <HourglassBottomRounded />,
    },
  ];

  return (
    <Stack spacing={{ xs: 2, md: 2.5 }} sx={{ maxWidth: 1440, mx: "auto" }}>
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2.25, sm: 3 },
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          alignItems: { xs: "stretch", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
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
            <EmojiEventsOutlined />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h3"
              sx={{ fontSize: { xs: "1.5rem", sm: "2rem" }, lineHeight: 1.25 }}
            >
              จัดการแคมเปญรางวัล
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              กำหนดช่วงสะสมคะแนน รางวัล และติดตามผลของแต่ละรอบ
            </Typography>
          </Box>
        </Stack>
        <Button
          component={Link}
          to="/campaigns/manage/new"
          variant="contained"
          startIcon={<AddOutlined />}
          sx={{
            minHeight: 44,
            px: 2.25,
            borderRadius: 1.75,
            flex: "0 0 auto",
          }}
        >
          สร้างแคมเปญ
        </Button>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            md: "repeat(4, minmax(0, 1fr))",
          },
          gap: { xs: 1.25, md: 1.75 },
        }}
      >
        {summary.map((item) => (
          <Paper
            key={item.label}
            variant="outlined"
            sx={{
              p: { xs: 1.5, sm: 2 },
              minHeight: { xs: 92, sm: 104 },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              borderColor: "#E2DCEB",
              borderRadius: 2.25,
              boxShadow: "0 5px 16px rgba(48,37,78,.04)",
            }}
          >
            <Box>
              <Typography
                sx={{
                  color: item.color,
                  fontSize: { xs: "1.35rem", sm: "1.65rem" },
                  fontWeight: 700,
                  lineHeight: 1.1,
                }}
              >
                {item.value.toLocaleString("th-TH")}
              </Typography>
              <Typography sx={{ mt: 0.75, color: "#61586E", fontSize: ".78rem" }}>
                {item.label}
              </Typography>
            </Box>
            <Box
              sx={{
                width: { xs: 34, sm: 40 },
                height: { xs: 34, sm: 40 },
                flex: "0 0 auto",
                display: "grid",
                placeItems: "center",
                borderRadius: 1.5,
                color: item.color,
                bgcolor: item.background,
              }}
            >
              {item.icon}
            </Box>
          </Paper>
        ))}
      </Box>

      <Paper
        variant="outlined"
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderColor: "#E0D9EA",
          borderRadius: 2.25,
          boxShadow: "0 7px 20px rgba(48,37,78,.045)",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ alignItems: { sm: "center" } }}
        >
          <TextField
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ค้นหาชื่อแคมเปญหรือของรางวัล"
            aria-label="ค้นหาแคมเปญ"
            size="small"
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded color="action" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            select
            label="สถานะแคมเปญ"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "all" | "active" | "ended")
            }
            size="small"
            sx={{ minWidth: { sm: 240 } }}
          >
            <MenuItem value="all">ทุกสถานะ</MenuItem>
            <MenuItem value="active">กำลังดำเนินการ</MenuItem>
            <MenuItem value="ended">ปิดรอบแล้ว</MenuItem>
          </TextField>
        </Stack>
        <Typography sx={{ mt: 1.25, color: "#746B80", fontSize: ".76rem" }}>
          แสดง {filteredCampaigns.length.toLocaleString("th-TH")} จาก {allCampaigns.length.toLocaleString("th-TH")} แคมเปญ
        </Typography>
      </Paper>

      {feedback && (
        <Alert
          severity={feedback.severity}
          onClose={() => setFeedback(undefined)}
        >
          {feedback.text}
        </Alert>
      )}
      {campaigns.isError && (
        <Alert severity="error">ไม่สามารถโหลดรายการแคมเปญได้</Alert>
      )}
      {campaigns.isLoading ? (
        <Box sx={{ minHeight: 240, display: "grid", placeItems: "center" }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={2}>
          {filteredCampaigns.map((campaign) => (
            <CampaignListCard
              key={campaign.id}
              campaign={campaign}
              onClose={setCloseTarget}
              onAwardAction={(action) => {
                setAwardNote("");
                setAwardAction(action);
              }}
            />
          ))}
          {!filteredCampaigns.length && (
            <Paper
              variant="outlined"
              sx={{
                minHeight: 260,
                p: { xs: 3, sm: 5 },
                display: "grid",
                placeItems: "center",
                textAlign: "center",
                borderColor: "#E0D9EA",
                borderRadius: 2.5,
              }}
            >
              <Box>
                <Box
                  sx={{
                    width: 58,
                    height: 58,
                    mx: "auto",
                    display: "grid",
                    placeItems: "center",
                    color: "#8577A5",
                    bgcolor: "#F1EDF7",
                    borderRadius: "50%",
                  }}
                >
                  <CampaignRounded sx={{ fontSize: 30 }} />
                </Box>
                <Typography variant="h6" sx={{ mt: 1.25 }}>
                  {allCampaigns.length
                    ? "ไม่พบแคมเปญที่ตรงกับตัวกรอง"
                    : "ยังไม่มีแคมเปญ"}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  {allCampaigns.length
                    ? "ลองเปลี่ยนสถานะหรือคำค้นหาแล้วตรวจสอบอีกครั้ง"
                    : "สร้างแคมเปญเพื่อเริ่มสะสมคะแนนและจัดอันดับผู้แจ้งเหตุ"}
                </Typography>
                {allCampaigns.length ? (
                  <Button
                    variant="outlined"
                    sx={{ mt: 2, borderRadius: 1.75 }}
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("all");
                    }}
                  >
                    ล้างตัวกรอง
                  </Button>
                ) : (
                  <Button
                    component={Link}
                    to="/campaigns/manage/new"
                    variant="contained"
                    startIcon={<AddOutlined />}
                    sx={{ mt: 2, borderRadius: 1.75 }}
                  >
                    สร้างแคมเปญแรก
                  </Button>
                )}
              </Box>
            </Paper>
          )}
        </Stack>
      )}

      <ActionDialog
        open={Boolean(closeTarget)}
        title="ยืนยันการปิดรอบแคมเปญ"
        icon={<LockOutlined color="warning" />}
        onRequestClose={
          close.isPending ? undefined : () => setCloseTarget(undefined)
        }
        footer={
          <>
            <Button
              disabled={close.isPending}
              onClick={() => setCloseTarget(undefined)}
            >
              ยกเลิก
            </Button>
            <Button
              variant="contained"
              color="warning"
              disabled={close.isPending || !closeTarget}
              onClick={() => closeTarget && close.mutate(closeTarget.id)}
            >
              ยืนยันปิดรอบ
            </Button>
          </>
        }
      >
        <Typography>
          ระบบจะล็อกอันดับ สร้างรายการรางวัลให้ผู้ชนะ
          และคืนรางวัลที่สำรองเกินจำนวนผู้ได้รับคะแนน
        </Typography>
      </ActionDialog>

      <ActionDialog
        open={Boolean(awardAction)}
        title={
          awardAction?.status === "fulfilled"
            ? "ยืนยันการส่งมอบ"
            : "ยืนยันการยกเลิกรางวัล"
        }
        icon={
          awardAction?.status === "fulfilled" ? (
            <CheckCircleOutlined color="success" />
          ) : (
            <CancelOutlined color="error" />
          )
        }
        onRequestClose={
          updateAward.isPending ? undefined : () => setAwardAction(undefined)
        }
        footer={
          <>
            <Button
              disabled={updateAward.isPending}
              onClick={() => setAwardAction(undefined)}
            >
              กลับ
            </Button>
            <Button
              variant="contained"
              color={awardAction?.status === "fulfilled" ? "success" : "error"}
              disabled={updateAward.isPending || !awardAction}
              onClick={() =>
                awardAction &&
                updateAward.mutate({
                  id: awardAction.award.id,
                  status: awardAction.status,
                  note: awardNote,
                })
              }
            >
              ยืนยัน
            </Button>
          </>
        }
      >
        <Stack spacing={2}>
          <Typography>
            {awardAction?.award.winnerName} ·{" "}
            {awardAction?.campaign.reward?.name}
          </Typography>
          {awardAction?.status === "cancelled" && (
            <Alert severity="warning">
              เมื่อยกเลิก ระบบจะคืนของรางวัล 1 ชิ้นเข้าสู่สต็อก
            </Alert>
          )}
          <TextField
            label="หมายเหตุ (ถ้ามี)"
            value={awardNote}
            onChange={(event) => setAwardNote(event.target.value)}
            multiline
            minRows={2}
            slotProps={{ htmlInput: { maxLength: 500 } }}
            fullWidth
          />
        </Stack>
      </ActionDialog>
    </Stack>
  );
}
