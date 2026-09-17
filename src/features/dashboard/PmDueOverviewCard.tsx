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
  const isError = tone === "error.main";
  const isWarning = tone === "warning.main";

  return (
    <Box
      sx={{
        minWidth: 0,
        px: 2,
        py: 1.25,
        border: 1,
        borderColor: isError
          ? "rgba(193, 68, 58, 0.2)"
          : isWarning
            ? "rgba(198, 138, 46, 0.2)"
            : "divider",
        borderRadius: 1.5,
        bgcolor: isError
          ? "rgba(193, 68, 58, 0.03)"
          : isWarning
            ? "rgba(198, 138, 46, 0.03)"
            : "rgba(242, 238, 248, 0.4)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontWeight: 500, fontSize: "0.8125rem" }}
      >
        {label}
      </Typography>
      <Typography
        variant="h4"
        color={tone}
        sx={{
          mt: 0.25,
          fontWeight: 700,
          letterSpacing: "-0.01em",
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1.2,
        }}
      >
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
      {/* 1. PM Summary Metrics */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
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

      {/* 2. Main Content: Follow-up List (~67%) vs Monthly Activity (~33%) */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "minmax(0, 1.9fr) minmax(310px, 1fr)",
          },
          gap: 2.5,
          mt: 2.5,
          alignItems: "start",
        }}
      >
        {/* Left: Follow-up PM List */}
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
              <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
                รายการที่ต้องติดตาม
              </Typography>
              <Typography variant="caption" color="text.secondary">
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
                sx={{ fontWeight: 600, height: 24, fontSize: "0.75rem" }}
              />
            )}
          </Stack>

          {/* 2-Column Compact Card Grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
              },
              gap: 1.5,
            }}
          >
            {dueItems.length ? (
              dueItems.map((item) => {
                const isOverdue = item.state === "overdue";
                return (
                  <Box
                    key={item.id}
                    sx={{
                      minWidth: 0,
                      px: 2,
                      py: 1.5,
                      border: 1,
                      borderColor: isOverdue
                        ? "rgba(193, 68, 58, 0.25)"
                        : "divider",
                      borderRadius: 1.5,
                      bgcolor: isOverdue
                        ? "rgba(193, 68, 58, 0.02)"
                        : "background.paper",
                      transition:
                        "box-shadow 0.15s ease, border-color 0.15s ease",
                      "&:hover": {
                        boxShadow: "0px 3px 12px rgba(75, 59, 134, 0.06)",
                        borderColor: isOverdue
                          ? "error.main"
                          : "primary.light",
                      },
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 1.25,
                      }}
                    >
                      <Link
                        component={RouterLink}
                        to={`/pm/${item.id}/complete`}
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.9375rem",
                          color: "text.primary",
                          overflowWrap: "anywhere",
                          textDecoration: "none",
                          lineHeight: 1.35,
                          "&:hover": {
                            color: "primary.main",
                            textDecoration: "underline",
                          },
                        }}
                      >
                        {item.assetName}
                      </Link>
                      <Chip
                        size="small"
                        color={isOverdue ? "error" : "warning"}
                        variant="outlined"
                        label={
                          isOverdue
                            ? "เกินกำหนด"
                            : thaiDate.format(new Date(item.nextDueAt))
                        }
                        sx={{
                          flexShrink: 0,
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          height: 22,
                          "& .MuiChip-label": { px: 0.85 },
                        }}
                      />
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mt: 0.75, overflowWrap: "anywhere" }}
                    >
                      {item.locationLabel}
                    </Typography>
                  </Box>
                );
              })
            ) : (
              <Box
                sx={{
                  gridColumn: "1 / -1",
                  py: 3,
                  px: 2,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1.5,
                  textAlign: "center",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  ไม่มีแผน PM ที่ครบกำหนดภายใน 30 วัน
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Right: Monthly PM Activity Feed */}
        <Box
          sx={{
            minWidth: 0,
            p: 2,
            border: 1,
            borderColor: "divider",
            borderRadius: 1.5,
            bgcolor: "rgba(242, 238, 248, 0.3)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
            ผล PM ในเดือนที่เลือก
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
            ดำเนินการ {completedCount.toLocaleString("th-TH")} ครั้ง ·{" "}
            {completedPlanCount.toLocaleString("th-TH")} แผน (ตามวันที่ดำเนินการ)
          </Typography>

          {latestCompletions.length ? (
            <Box
              sx={{
                mt: 1.5,
                maxHeight: 380,
                overflowY: "auto",
                pr: 0.5,
                "&::-webkit-scrollbar": { width: 5 },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: "divider",
                  borderRadius: 3,
                },
              }}
            >
              <Stack spacing={1.25}>
                {latestCompletions.map((log, index) => (
                  <Box
                    key={log.id}
                    sx={{
                      minWidth: 0,
                      pb: index === latestCompletions.length - 1 ? 0 : 1.25,
                      borderBottom:
                        index === latestCompletions.length - 1 ? 0 : 1,
                      borderColor: "divider",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        gap: 1,
                      }}
                    >
                      <Link
                        component={RouterLink}
                        to={`/pm/${log.scheduleId}/complete?tab=history`}
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.875rem",
                          color: "text.primary",
                          textDecoration: "none",
                          overflowWrap: "anywhere",
                          "&:hover": {
                            color: "primary.main",
                            textDecoration: "underline",
                          },
                        }}
                      >
                        {log.assetName}
                      </Link>
                    </Box>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mt: 0.2 }}
                    >
                      {thaiDate.format(new Date(log.completedAt))} · {log.technicianName}
                    </Typography>

                    {/* Read-only Result/Note - Visually light, no input-like border! */}
                    <Typography
                      variant="caption"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        color: log.notes ? "text.primary" : "text.secondary",
                        fontStyle: log.notes ? "normal" : "italic",
                        bgcolor: "rgba(255, 255, 255, 0.6)",
                        px: 1,
                        py: 0.4,
                        borderRadius: 0.75,
                        mt: 0.5,
                        borderLeft: "2px solid",
                        borderLeftColor: log.notes ? "success.main" : "divider",
                        lineHeight: 1.45,
                      }}
                    >
                      {log.notes || "ไม่มีหมายเหตุ"}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          ) : (
            <Box sx={{ py: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                ยังไม่มีผลการดำเนินการในเดือนนี้
              </Typography>
            </Box>
          )}

          {!!unassignedCount && (
            <Box sx={{ mt: 1.5, pt: 1.25, borderTop: 1, borderColor: "divider" }}>
              <Link
                component={RouterLink}
                to="/pm"
                sx={{
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "primary.main",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                จัดการแผน PM ที่ยังไม่มอบหมายช่าง →
              </Link>
            </Box>
          )}
        </Box>
      </Box>
    </MainCard>
  );
}
