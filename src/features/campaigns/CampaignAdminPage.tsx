import {
  AddOutlined,
  CalendarMonthOutlined,
  CardGiftcardOutlined,
  EmojiEventsOutlined,
  LockOutlined,
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { MainCard } from "../../components/base/MainCard";
import { ActionDialog } from "../../components/feedback/ActionDialog";
import type { RewardCampaign } from "../../types/reward";
import {
  campaignPeriodLabel,
  campaignStatusLabel,
  formatCampaignPeriod,
} from "./campaign.constants";
import { closeCampaign, getCampaigns } from "./campaignApi";

function CampaignListCard({
  campaign,
  onClose,
}: {
  campaign: RewardCampaign;
  onClose: (campaign: RewardCampaign) => void;
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
              variant="text"
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
      <Stack spacing={1.25}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <CalendarMonthOutlined color="primary" fontSize="small" />
          <Typography>
            {formatCampaignPeriod(campaign.startDate, campaign.endDate)}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
          <CardGiftcardOutlined
            color="primary"
            fontSize="small"
            sx={{ mt: 0.25 }}
          />
          <Box>
            <Typography variant="body2" color="text.secondary">
              รางวัลสำหรับผู้ชนะ
            </Typography>
            <Typography>{campaign.prizeDescription}</Typography>
          </Box>
        </Stack>
      </Stack>
    </MainCard>
  );
}

export function CampaignAdminPage() {
  const queryClient = useQueryClient();
  const campaigns = useQuery({ queryKey: ["campaigns"], queryFn: getCampaigns });
  const [target, setTarget] = useState<RewardCampaign>();
  const [feedback, setFeedback] = useState<string>();
  const close = useMutation({
    mutationFn: closeCampaign,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      setTarget(undefined);
      setFeedback("ปิดรอบแคมเปญและล็อกผลการจัดอันดับแล้ว");
    },
    onError: (cause) =>
      setFeedback(cause instanceof Error ? cause.message : "ไม่สามารถปิดรอบแคมเปญได้"),
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
        <Alert severity="success" onClose={() => setFeedback(undefined)}>
          {feedback}
        </Alert>
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
              onClose={setTarget}
            />
          ))}
          {!campaigns.data?.length && (
            <MainCard title={<Typography variant="h5">ยังไม่มีแคมเปญ</Typography>}>
              <Typography color="text.secondary">
                สร้างแคมเปญเพื่อเริ่มสะสมคะแนนและจัดอันดับผู้แจ้งเหตุ
              </Typography>
            </MainCard>
          )}
        </Stack>
      )}
      <ActionDialog
        open={Boolean(target)}
        title="ยืนยันการปิดรอบแคมเปญ"
        icon={<LockOutlined color="warning" />}
        onRequestClose={close.isPending ? undefined : () => setTarget(undefined)}
        footer={
          <>
            <Button disabled={close.isPending} onClick={() => setTarget(undefined)}>
              ยกเลิก
            </Button>
            <Button
              variant="contained"
              color="warning"
              disabled={close.isPending || !target}
              onClick={() => target && close.mutate(target.id)}
            >
              ยืนยันปิดรอบ
            </Button>
          </>
        }
      >
        <Typography>
          เมื่อปิดรอบ “{target?.name}” คะแนนจะหยุดสะสมและผลการจัดอันดับจะถูกล็อก
        </Typography>
      </ActionDialog>
    </Stack>
  );
}
