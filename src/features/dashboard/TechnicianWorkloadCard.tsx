import { EngineeringOutlined } from "@mui/icons-material";
import { Box, Chip, Stack, Typography } from "@mui/material";
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
        data.map((item, index) => (
          <Box
            key={item.technicianId}
            sx={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) auto",
              gap: 2,
              alignItems: "center",
              px: { xs: 2.5, md: 3 },
              py: 1.5,
              borderBottom: index === data.length - 1 ? 0 : 1,
              borderColor: "divider",
            }}
          >
            <Typography sx={{ fontWeight: 600, overflowWrap: "anywhere" }}>
              {item.technicianName}
            </Typography>
            <Typography color="primary.main" sx={{ fontWeight: 700 }}>
              {Number(
                item.assignedCount ??
                  (item as { activeCount?: number }).activeCount ??
                  0,
              ).toLocaleString("th-TH")}{" "}
              งาน
            </Typography>
            {item.primaryCount !== undefined && (
              <Box sx={{ gridColumn: "1 / -1" }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  ช่างหลัก {item.primaryCount} · ช่างร่วม{" "}
                  {item.supportCount ?? 0} งาน
                </Typography>
                <Stack
                  direction="row"
                  useFlexGap
                  spacing={0.75}
                  sx={{ flexWrap: "wrap" }}
                >
                  <Chip size="small" label={`ค้าง ${item.activeCount ?? 0}`} />
                  <Chip
                    size="small"
                    variant="outlined"
                    color={item.overdueCount ? "error" : "default"}
                    label={`เกิน SLA ${item.overdueCount ?? 0}`}
                  />
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`รออนุมัติ/ตรวจรับ ${item.pendingReviewCount ?? 0}`}
                  />
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`PM ${item.pmAssignedCount ?? 0} แผน · ต้องติดตาม ${item.pmDueCount ?? 0}`}
                  />
                </Stack>
              </Box>
            )}
          </Box>
        ))
      ) : (
        <Typography color="text.secondary" sx={{ p: 3 }}>
          ยังไม่มีช่างที่ได้รับอนุมัติในระบบ
        </Typography>
      )}
    </MainCard>
  );
}
