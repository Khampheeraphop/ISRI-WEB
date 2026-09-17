import { EngineeringOutlined } from "@mui/icons-material";
import { Box, Stack, Typography } from "@mui/material";
import { MainCard } from "../../components/base/MainCard";
import type { DashboardSummary } from "./dashboardApi";

export function TechnicianWorkloadCard({
  data,
}: {
  data: DashboardSummary["technicianWorkload"];
}) {
  return (
    <MainCard
      title={
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <EngineeringOutlined color="primary" />
          <Typography variant="h6">ภาระงานของช่าง</Typography>
        </Stack>
      }
      subheader="งานมอบหมายตามเดือนที่เลือก · งานค้างและ PM ณ ปัจจุบัน"
      contentSx={{ p: 0 }}
    >
      {data.length ? (
        <Box
          sx={{
            maxHeight: 560,
            overflowY: "auto",
            "&::-webkit-scrollbar": { width: 6 },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "divider",
              borderRadius: 3,
            },
          }}
        >
          {data.map((item, index) => {
            const assignedTotal = Number(
              item.assignedCount ??
                (item as { activeCount?: number }).activeCount ??
                0,
            );
            const overdue = item.overdueCount ?? 0;
            const active = item.activeCount ?? 0;
            const pendingReview = item.pendingReviewCount ?? 0;
            const pmAssigned = item.pmAssignedCount ?? 0;
            const pmDue = item.pmDueCount ?? 0;

            return (
              <Box
                key={item.technicianId}
                sx={{
                  px: { xs: 2, md: 2.5 },
                  py: 1.75,
                  borderBottom: index === data.length - 1 ? 0 : 1,
                  borderColor: "divider",
                  transition: "background-color 0.15s ease",
                  "&:hover": {
                    bgcolor: "rgba(75, 59, 134, 0.02)",
                  },
                }}
              >
                {/* Header: Name + Total Workload */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: "text.primary",
                      fontSize: "0.95rem",
                    }}
                  >
                    {item.technicianName}
                  </Typography>
                  <Box
                    sx={{
                      px: 1.25,
                      py: 0.25,
                      borderRadius: 1,
                      bgcolor: "rgba(75, 59, 134, 0.08)",
                      color: "primary.main",
                      fontWeight: 700,
                      fontSize: "0.8125rem",
                      fontVariantNumeric: "tabular-nums",
                      flexShrink: 0,
                    }}
                  >
                    {assignedTotal.toLocaleString("th-TH")} งาน
                  </Box>
                </Box>

                {item.primaryCount !== undefined && (
                  <Box sx={{ mt: 0.5 }}>
                    {/* Secondary: Main vs Support */}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 1 }}
                    >
                      ช่างหลัก {item.primaryCount} · ช่างร่วม{" "}
                      {item.supportCount ?? 0} งาน
                    </Typography>

                    {/* Compact Status Indicators */}
                    <Stack
                      direction="row"
                      useFlexGap
                      spacing={0.75}
                      sx={{ flexWrap: "wrap", alignItems: "center" }}
                    >
                      {/* Active / Backlog */}
                      <Box
                        sx={{
                          fontSize: "0.75rem",
                          px: 1,
                          py: 0.35,
                          borderRadius: 1,
                          fontWeight: 500,
                          bgcolor: active > 0 ? "rgba(106, 94, 138, 0.08)" : "transparent",
                          color: active > 0 ? "text.primary" : "text.secondary",
                          border: active > 0 ? "none" : "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        ค้าง {active}
                      </Box>

                      {/* Overdue SLA */}
                      <Box
                        sx={{
                          fontSize: "0.75rem",
                          px: 1,
                          py: 0.35,
                          borderRadius: 1,
                          fontWeight: overdue > 0 ? 700 : 500,
                          bgcolor:
                            overdue > 0
                              ? "rgba(193, 68, 58, 0.1)"
                              : "transparent",
                          color: overdue > 0 ? "error.main" : "text.secondary",
                          border: overdue > 0 ? "none" : "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        เกิน SLA {overdue}
                      </Box>

                      {/* Pending Review */}
                      <Box
                        sx={{
                          fontSize: "0.75rem",
                          px: 1,
                          py: 0.35,
                          borderRadius: 1,
                          fontWeight: pendingReview > 0 ? 600 : 500,
                          bgcolor:
                            pendingReview > 0
                              ? "rgba(198, 138, 46, 0.1)"
                              : "transparent",
                          color:
                            pendingReview > 0 ? "warning.main" : "text.secondary",
                          border: pendingReview > 0 ? "none" : "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        รอตรวจรับ {pendingReview}
                      </Box>

                      {/* PM */}
                      <Box
                        sx={{
                          fontSize: "0.75rem",
                          px: 1,
                          py: 0.35,
                          borderRadius: 1,
                          fontWeight: pmDue > 0 ? 600 : 500,
                          bgcolor:
                            pmDue > 0
                              ? "rgba(198, 138, 46, 0.08)"
                              : "transparent",
                          color: pmDue > 0 ? "warning.main" : "text.secondary",
                          border: pmDue > 0 ? "none" : "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        PM {pmAssigned} แผน · ติดตาม {pmDue}
                      </Box>
                    </Stack>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      ) : (
        <Typography color="text.secondary" sx={{ p: 3 }}>
          ยังไม่มีช่างที่ได้รับอนุมัติในระบบ
        </Typography>
      )}
    </MainCard>
  );
}
