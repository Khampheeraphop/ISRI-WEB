import { BuildCircleOutlined } from "@mui/icons-material";
import { Box, Chip, Stack, Typography } from "@mui/material";
import { MainCard } from "../../components/base/MainCard";
import type { DashboardSummary } from "./dashboardApi";

const thaiDate = new Intl.DateTimeFormat("th-TH", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function PmDueOverviewCard({ data }: { data?: DashboardSummary["pm"] }) {
  const overview = data ?? { overdueCount: 0, dueSoonCount: 0, items: [] };
  return (
    <MainCard
      title={
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <BuildCircleOutlined color="primary" />
          <Typography variant="h6">แผน PM ที่ต้องติดตาม</Typography>
        </Stack>
      }
      subheader="สถานะ ณ ปัจจุบัน"
      contentSx={{ p: 0 }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Box sx={{ px: 2.5, py: 1.75, borderRight: 1, borderColor: "divider" }}>
          <Typography variant="body2" color="text.secondary">
            ครบกำหนดแล้ว
          </Typography>
          <Typography variant="h5" color="error.main" sx={{ mt: 0.25 }}>
            {overview.overdueCount.toLocaleString("th-TH")}
          </Typography>
        </Box>
        <Box sx={{ px: 2.5, py: 1.75 }}>
          <Typography variant="body2" color="text.secondary">
            ภายใน 30 วัน
          </Typography>
          <Typography variant="h5" color="warning.main" sx={{ mt: 0.25 }}>
            {overview.dueSoonCount.toLocaleString("th-TH")}
          </Typography>
        </Box>
      </Box>

      {overview.items.length ? (
        overview.items.map((item, index) => (
          <Box
            key={item.id}
            sx={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) auto",
              alignItems: "center",
              gap: 1.5,
              px: 2.5,
              py: 1.5,
              borderBottom: index === overview.items.length - 1 ? 0 : 1,
              borderColor: "divider",
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography noWrap sx={{ fontWeight: 600 }}>
                {item.assetName}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {item.locationLabel}
              </Typography>
            </Box>
            <Chip
              size="small"
              color={item.state === "overdue" ? "error" : "warning"}
              variant="outlined"
              label={
                item.state === "overdue"
                  ? "เกินกำหนด"
                  : thaiDate.format(new Date(item.nextDueAt))
              }
            />
          </Box>
        ))
      ) : (
        <Typography color="text.secondary" sx={{ p: 2.5 }}>
          ไม่มีแผน PM ที่ครบกำหนดภายใน 30 วัน
        </Typography>
      )}
    </MainCard>
  );
}
