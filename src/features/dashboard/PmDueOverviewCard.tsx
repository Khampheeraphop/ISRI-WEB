import { BuildCircleOutlined } from "@mui/icons-material";
import { Box, Chip, Link, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { MainCard } from "../../components/base/MainCard";
import type { DashboardSummary } from "./dashboardApi";

const thaiDate = new Intl.DateTimeFormat("th-TH", {
  timeZone: "Asia/Bangkok",
  day: "numeric",
  month: "short",
  year: "numeric",
});

function SummaryTile({
  label,
  value,
  tone = "text.primary",
}: {
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <Box
      sx={{
        minWidth: 0,
        px: 2.25,
        py: 1.75,
        border: 1,
        borderColor: "divider",
        borderRadius: 1.5,
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5" color={tone} sx={{ mt: 0.35 }}>
        {value.toLocaleString("th-TH")}
      </Typography>
    </Box>
  );
}

export function PmDueOverviewCard({ data }: { data?: DashboardSummary["pm"] }) {
  const overview = data ?? { overdueCount: 0, dueSoonCount: 0, items: [] };
  const dueItems = overview.items ?? [];
  const latestCompletions = overview.latestCompletions ?? [];
  const completedCount = overview.completedCount ?? 0;
  const completedPlanCount = overview.completedPlanCount ?? 0;
  const unassignedCount = overview.unassignedCount ?? 0;

  return (
    <MainCard
      title={
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <BuildCircleOutlined color="primary" />
          <Typography variant="h6">แผน PM ที่ต้องติดตาม</Typography>
        </Stack>
      }
      subheader="สถานะ ณ ปัจจุบัน"
      contentSx={{ p: { xs: 2, md: 2.5 } }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
          gap: 1.5,
        }}
      >
        <SummaryTile
          label="เกินกำหนด"
          value={overview.overdueCount}
          tone="error.main"
        />
        <SummaryTile
          label="ภายใน 30 วัน"
          value={overview.dueSoonCount}
          tone="warning.main"
        />
        <SummaryTile label="ยังไม่มอบหมายช่าง" value={unassignedCount} />
        <SummaryTile label="ผล PM เดือนนี้" value={completedCount} />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", xl: "minmax(0, 1.45fr) 360px" },
          gap: 2.5,
          mt: 2.5,
          alignItems: "start",
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              mb: 1.5,
            }}
          >
            <Box>
              <Typography sx={{ fontWeight: 700 }}>
                รายการที่ต้องติดตาม
              </Typography>
              <Typography variant="body2" color="text.secondary">
                แผนที่เกินกำหนดหรือครบกำหนดภายใน 30 วัน
              </Typography>
            </Box>
            {!!unassignedCount && (
              <Chip
                component={RouterLink}
                to="/pm"
                clickable
                size="small"
                color="warning"
                variant="outlined"
                label={`ยังไม่มอบหมาย ${unassignedCount} แผน`}
              />
            )}
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
                xl: "repeat(3, minmax(0, 1fr))",
              },
              gap: 1.5,
            }}
          >
            {dueItems.length ? (
              dueItems.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    minWidth: 0,
                    p: 1.75,
                    border: 1,
                    borderColor:
                      item.state === "overdue" ? "error.light" : "divider",
                    borderRadius: 1.5,
                    bgcolor:
                      item.state === "overdue"
                        ? "rgba(193, 68, 58, 0.04)"
                        : "background.paper",
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 1.5,
                    }}
                  >
                    <Link
                      component={RouterLink}
                      to={`/pm/${item.id}/complete`}
                      sx={{ fontWeight: 700, overflowWrap: "anywhere" }}
                    >
                      {item.assetName}
                    </Link>
                    <Chip
                      size="small"
                      color={item.state === "overdue" ? "error" : "warning"}
                      variant="outlined"
                      label={
                        item.state === "overdue"
                          ? "เกินกำหนด"
                          : thaiDate.format(new Date(item.nextDueAt))
                      }
                      sx={{ flexShrink: 0 }}
                    />
                  </Stack>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.75, overflowWrap: "anywhere" }}
                  >
                    {item.locationLabel}
                  </Typography>
                </Box>
              ))
            ) : (
              <Box
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1.5,
                }}
              >
                <Typography color="text.secondary">
                  ไม่มีแผน PM ที่ครบกำหนดภายใน 30 วัน
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        <Box
          sx={{
            minWidth: 0,
            p: 2,
            border: 1,
            borderColor: "divider",
            borderRadius: 1.5,
            bgcolor: "rgba(100, 127, 168, 0.04)",
          }}
        >
          <Typography sx={{ fontWeight: 700 }}>
            ผล PM ในเดือนที่เลือก
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            ดำเนินการ {completedCount.toLocaleString("th-TH")} ครั้ง ·{" "}
            {completedPlanCount.toLocaleString("th-TH")} แผน
            (ตามวันที่ดำเนินการ)
          </Typography>

          {latestCompletions.length ? (
            <Stack spacing={1.5} sx={{ mt: 1.75 }}>
              {latestCompletions.map((log) => (
                <Box
                  key={log.id}
                  sx={{ minWidth: 0, overflowWrap: "anywhere" }}
                >
                  <Link
                    component={RouterLink}
                    to={`/pm/${log.scheduleId}/complete?tab=history`}
                    sx={{ fontWeight: 700 }}
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
                      mt: 0.25,
                      whiteSpace: "pre-wrap",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {log.notes || "ไม่มีหมายเหตุ"}
                  </Typography>
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              ยังไม่มีผลการดำเนินการในเดือนนี้
            </Typography>
          )}

          {!!unassignedCount && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              <Link component={RouterLink} to="/pm">
                ไปจัดการแผน PM ที่ยังไม่มอบหมายช่าง
              </Link>
            </Typography>
          )}
        </Box>
      </Box>
    </MainCard>
  );
}
