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
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
          },
          gap: 2,
        }}
      >
        {metrics.map((metric) => (
          <Box
            key={metric.label}
            sx={{
              p: 2,
              borderRadius: 1.5,
              bgcolor: "rgba(242, 238, 248, 0.45)",
              border: 1,
              borderColor: "divider",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              {metric.label}
            </Typography>
            <Box
              sx={{
                mt: 1,
                display: "flex",
                alignItems: "baseline",
                gap: 0.75,
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                  letterSpacing: "-0.01em",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {metric.value.toLocaleString("th-TH")}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                {metric.suffix}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </MainCard>
  );
}
