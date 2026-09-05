import { BuildCircleOutlined } from "@mui/icons-material";
import { Box, Chip, Stack, Typography, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { MainCard } from "../../components/base/MainCard";
import type { DashboardSummary } from "./dashboardApi";

const thaiDate = new Intl.DateTimeFormat("th-TH", {
  timeZone: "Asia/Bangkok",
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
            เกินกำหนด
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
              <Link
                component={RouterLink}
                to={`/pm/${item.id}/complete`}
                sx={{ fontWeight: 600 }}
              >
                {item.assetName}
              </Link>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ overflowWrap: "anywhere" }}
              >
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
      {!!data?.unassignedCount && (
        <Typography
          color="warning.main"
          variant="body2"
          sx={{ px: 2.5, py: 1.5 }}
        >
          ยังไม่มอบหมายช่าง {data.unassignedCount} แผน ·{" "}
          <Link component={RouterLink} to="/pm">
            จัดการแผน PM
          </Link>
        </Typography>
      )}
      {data?.completedCount !== undefined && (
        <Box sx={{ p: 2.5, borderTop: 1, borderColor: "divider" }}>
          <Typography sx={{ fontWeight: 600 }}>
            ผล PM ในเดือนที่เลือก
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            ดำเนินการ {data.completedCount} ครั้ง ·{" "}
            {data.completedPlanCount ?? 0} แผน (ตามวันที่ดำเนินการ)
          </Typography>
          {data.latestCompletions?.map((log) => (
            <Box key={log.id} sx={{ mt: 2, overflowWrap: "anywhere" }}>
              <Link
                component={RouterLink}
                to={`/pm/${log.scheduleId}/complete?tab=history`}
                sx={{ fontWeight: 600 }}
              >
                {log.assetName}
              </Link>
              <Typography variant="body2" color="text.secondary">
                {thaiDate.format(new Date(log.completedAt))} ·{" "}
                {log.technicianName}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: "pre-wrap",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {log.notes || "ไม่มีหมายเหตุ"}
              </Typography>
            </Box>
          ))}
          {data.completedCount === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              ยังไม่มีผลการดำเนินการในเดือนนี้
            </Typography>
          )}
        </Box>
      )}
    </MainCard>
  );
}
