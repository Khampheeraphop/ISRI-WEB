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
          <Typography variant="h6">งานที่มอบหมายในช่วงเวลา</Typography>
        </Stack>
      }
      subheader="จำนวนใบงานที่จัดสรรให้ช่างในเดือนที่เลือก"
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
            <Typography noWrap sx={{ fontWeight: 600 }}>
              {item.technicianName}
            </Typography>
            <Typography color="primary.main" sx={{ fontWeight: 700 }}>
              {Number(
                item.assignedCount ??
                  (item as { activeCount?: number }).activeCount ??
                  0,
              ).toLocaleString("th-TH")} งาน
            </Typography>
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
