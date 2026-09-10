import {
  AddOutlined,
  CalendarMonthOutlined,
  CancelOutlined,
  CardGiftcardOutlined,
  CheckCircleOutlined,
  EmojiEventsOutlined,
  Inventory2Outlined,
  LockOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
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
                  objectFit: "contain",
                  p: 1,
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

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Box>
          <Typography variant="h3">จัดการแคมเปญรางวัล</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            กำหนดช่วงสะสมคะแนน รางวัล และผลการจัดอันดับของแต่ละรอบ
          </Typography>
        </Box>
        <Button
          component={Link}
          to="/campaigns/manage/new"
          variant="contained"
          startIcon={<AddOutlined />}
        >
          สร้างแคมเปญ
        </Button>
      </Box>
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
          {(campaigns.data ?? []).map((campaign) => (
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
          {!campaigns.data?.length && (
            <MainCard
              title={<Typography variant="h5">ยังไม่มีแคมเปญ</Typography>}
            >
              <Typography color="text.secondary">
                สร้างแคมเปญเพื่อเริ่มสะสมคะแนนและจัดอันดับผู้แจ้งเหตุ
              </Typography>
            </MainCard>
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
