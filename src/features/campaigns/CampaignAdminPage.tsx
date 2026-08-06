import {
  AddOutlined,
  CalendarMonthOutlined,
  CardGiftcardOutlined,
  EmojiEventsOutlined,
} from "@mui/icons-material";
import { Alert, Box, Button, Chip, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { Link } from "react-router-dom";
import { MainCard } from "../../components/base/MainCard";
import { useEndCampaignMutation, useEntityQuery } from "../../hooks/useEntity";
import type { RewardCampaign } from "../../types/reward";
import {
  campaignPeriodLabel,
  campaignStatusLabel,
  formatCampaignPeriod,
} from "./campaign.constants";

function CampaignListCard({
  campaign,
  onEnd,
  isEnding,
}: {
  campaign: RewardCampaign;
  onEnd: (campaign: RewardCampaign) => void;
  isEnding: boolean;
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
              disabled={isEnding}
              onClick={() => onEnd(campaign)}
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
          <Typography>{formatCampaignPeriod(campaign.startDate, campaign.endDate)}</Typography>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
          <CardGiftcardOutlined color="primary" fontSize="small" sx={{ mt: 0.25 }} />
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
  const campaigns = useEntityQuery("rewardCampaigns");
  const endCampaign = useEndCampaignMutation();
  const [feedback, setFeedback] = useState<{
    severity: "success" | "error";
    message: string;
  }>();
  const handleEnd = (campaign: RewardCampaign) => {
    if (!window.confirm(`ปิดรอบ “${campaign.name}” และล็อกอันดับใช่หรือไม่`)) return;
    endCampaign.mutate(campaign.id, {
      onSuccess: () =>
        setFeedback({
          severity: "success",
          message: "ปิดรอบแคมเปญและล็อกอันดับแล้ว",
        }),
      onError: () =>
        setFeedback({
          severity: "error",
          message: "ไม่สามารถปิดรอบแคมเปญได้",
        }),
    });
  };

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
            กำหนดรอบสะสมคะแนน รางวัล และการประกาศผลผู้ชนะ
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
        <Alert severity={feedback.severity} onClose={() => setFeedback(undefined)}>
          {feedback.message}
        </Alert>
      )}
      <Stack spacing={2}>
        {(campaigns.data ?? []).map((campaign) => (
          <CampaignListCard
            key={campaign.id}
            campaign={campaign}
            onEnd={handleEnd}
            isEnding={endCampaign.isPending}
          />
        ))}
        {!campaigns.isLoading && !(campaigns.data ?? []).length && (
          <MainCard title={<Typography variant="h5">ยังไม่มีแคมเปญ</Typography>}>
            <Typography color="text.secondary">
              สร้างแคมเปญเพื่อเริ่มสะสมคะแนนและจัดอันดับผู้แจ้งเหตุ
            </Typography>
          </MainCard>
        )}
      </Stack>
    </Stack>
  );
}
