import { CardGiftcardOutlined } from "@mui/icons-material";
import { Box, Stack, Typography } from "@mui/material";
import { MainCard } from "../../components/base/MainCard";
import type { DashboardSummary } from "./dashboardApi";

export function IncentiveOverviewCard({
  data,
}: {
  data?: DashboardSummary["incentives"];
}) {
  const overview = data ?? {
    totalWalletPoints: 0,
    pointsIssued: 0,
    redemptionCount: 0,
    activeRewardCount: 0,
    activeCampaignCount: 0,
  };
  const metrics = [
    {
      label: "แต้มคงเหลือทั้งหมด",
      value: overview.totalWalletPoints,
      suffix: "แต้ม",
    },
    { label: "แต้มที่ออกในช่วงเวลา", value: overview.pointsIssued, suffix: "แต้ม" },
    { label: "รายการแลกรางวัล", value: overview.redemptionCount, suffix: "รายการ" },
    {
      label: "ของรางวัลที่เปิดแลก",
      value: overview.activeRewardCount,
      suffix: "รายการ",
    },
  ];
  return (
    <MainCard
      title={
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <CardGiftcardOutlined color="primary" />
          <Typography variant="h6">แรงจูงใจและของรางวัล</Typography>
        </Stack>
      }
      subheader={
        overview.activeCampaignCount
          ? `มีแคมเปญที่กำลังดำเนินการ ${overview.activeCampaignCount.toLocaleString("th-TH")} รายการ`
          : "ยังไม่มีแคมเปญที่กำลังดำเนินการ"
      }
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 2,
        }}
      >
        {metrics.map((metric) => (
          <Box key={metric.label}>
            <Typography variant="body2" color="text.secondary">
              {metric.label}
            </Typography>
            <Typography variant="h5" sx={{ mt: 0.35 }}>
              {metric.value.toLocaleString("th-TH")} {metric.suffix}
            </Typography>
          </Box>
        ))}
      </Box>
    </MainCard>
  );
}
