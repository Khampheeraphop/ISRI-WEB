import {
  AssignmentLateOutlined,
  FactCheckOutlined,
  HourglassTopOutlined,
  LocationOnOutlined,
  PersonAddAltOutlined,
  EngineeringOutlined,
  OpenInNewOutlined,
} from "@mui/icons-material";
import {
  Box,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import type { ApexOptions } from "apexcharts";
import { lazy, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { MainCard } from "../components/base/MainCard";
import {
  getDashboardSummary,
} from "../features/dashboard/dashboardApi";

const DashboardChart = lazy(() => import("react-apexcharts"));

const statusLabels: Record<string, string> = {
  submitted: "รับแจ้งแล้ว",
  pending_assignment: "รอจัดสรรงาน",
  assigned: "มอบหมายแล้ว",
  in_progress: "กำลังดำเนินการ",
  pending_parts_approval: "รออนุมัติเบิกอะไหล่",
  waiting_parts: "รออะไหล่",
  pending_repair_approval: "รอตรวจรับงานซ่อม",
  done: "เสร็จสิ้น",
};

const statusColors: Record<string, string> = {
  submitted: "#647FA8",
  pending_assignment: "#647FA8",
  assigned: "#647FA8",
  in_progress: "#C68A2E",
  pending_parts_approval: "#C68A2E",
  waiting_parts: "#9A80A8",
  pending_repair_approval: "#C68A2E",
  done: "#3B8F6D",
};

const thaiDateTime = new Intl.DateTimeFormat("th-TH", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});
const thaiMonth = new Intl.DateTimeFormat("th-TH", { month: "short" });

function minutesLabel(value: number | null) {
  if (value === null) return "–";
  if (value < 60) return `${value} นาที`;
  return `${Math.floor(value / 60)} ชม. ${value % 60} นาที`;
}

function AttentionCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  tone: "error" | "warning" | "info" | "success";
}) {
  const color =
    tone === "error"
      ? "error.main"
      : tone === "warning"
        ? "warning.main"
        : tone === "success"
          ? "success.main"
          : "info.main";
  return (
    <Box
      component={Link}
      to="/dispatch"
      sx={{
        display: "grid",
        gridTemplateColumns: "40px minmax(0, 1fr)",
        gap: 1.5,
        p: 2,
        border: 1,
        borderColor: "divider",
        borderTop: 3,
        borderTopColor: color,
        borderRadius: 1.5,
        color: "inherit",
        textDecoration: "none",
        "&:hover": { bgcolor: "action.hover" },
      }}
    >
      <Box sx={{ color, pt: 0.15 }}>{icon}</Box>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4" sx={{ mt: 0.25 }}>
          {value.toLocaleString("th-TH")}
        </Typography>
      </Box>
    </Box>
  );
}

function DashboardLoading() {
  return (
    <Stack spacing={3}>
      <Skeleton variant="rounded" height={92} />
      <Skeleton variant="rounded" height={108} />
      <Skeleton variant="rounded" height={390} />
    </Stack>
  );
}

export function DashboardPage() {
  const [days, setDays] = useState(30);
  const summaryQuery = useQuery({
    queryKey: ["dashboard-summary", days],
    queryFn: () => getDashboardSummary(days),
  });
  const summary = summaryQuery.data;

  const trendOptions = useMemo<ApexOptions>(
    () => ({
      chart: { fontFamily: "Anuphan, sans-serif", toolbar: { show: false } },
      colors: ["#4B3B86", "#AAA2C5"],
      dataLabels: { enabled: false },
      plotOptions: { bar: { borderRadius: 3, columnWidth: "42%" } },
      grid: { borderColor: "#E4E1ED", strokeDashArray: 3 },
      xaxis: {
        categories: (summary?.trend ?? []).map((item) =>
          thaiMonth.format(new Date(`${item.month}-01`)),
        ),
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: "#756E88", fontFamily: "Anuphan, sans-serif" } },
      },
      yaxis: { min: 0, forceNiceScale: true },
      legend: { position: "top", horizontalAlign: "right" },
      tooltip: { y: { formatter: (value) => `${value} รายการ` } },
    }),
    [summary?.trend],
  );

  const statusOptions = useMemo<ApexOptions>(
    () => ({
      chart: { fontFamily: "Anuphan, sans-serif", toolbar: { show: false } },
      labels: (summary?.statusCounts ?? []).map(
        (item) => statusLabels[item.status] ?? item.status,
      ),
      colors: (summary?.statusCounts ?? []).map(
        (item) => statusColors[item.status] ?? "#756E88",
      ),
      dataLabels: { enabled: false },
      legend: { show: false },
      stroke: { colors: ["#FFFFFF"], width: 3 },
      plotOptions: { pie: { donut: { size: "68%" } } },
      tooltip: { y: { formatter: (value) => `${value} รายการ` } },
    }),
    [summary?.statusCounts],
  );

  if (summaryQuery.isLoading) return <DashboardLoading />;
  if (summaryQuery.isError || !summary)
    return (
      <MainCard title="ไม่สามารถแสดงภาพรวมได้">
        <Typography color="text.secondary">
          กรุณาลองใหม่อีกครั้ง หรือแจ้งผู้ดูแลระบบหากปัญหายังคงอยู่
        </Typography>
      </MainCard>
    );

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="body2" color="primary.main" sx={{ mb: 0.5 }}>
            ภาพรวมระบบ
          </Typography>
          <Typography variant="h3">ภาพรวมการดำเนินงาน</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            อัปเดตข้อมูล {thaiDateTime.format(new Date(summary.generatedAt))} น.
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 190 }}>
          <InputLabel id="dashboard-period">ช่วงเวลา</InputLabel>
          <Select
            labelId="dashboard-period"
            label="ช่วงเวลา"
            value={days}
            onChange={(event) => setDays(Number(event.target.value))}
          >
            <MenuItem value={30}>30 วันล่าสุด</MenuItem>
            <MenuItem value={90}>90 วันล่าสุด</MenuItem>
            <MenuItem value={180}>6 เดือนล่าสุด</MenuItem>
            <MenuItem value={365}>1 ปีล่าสุด</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" },
          gap: 2,
        }}
      >
        <AttentionCard icon={<AssignmentLateOutlined />} label="เกิน SLA" value={summary.attention.overdue} tone="error" />
        <AttentionCard icon={<HourglassTopOutlined />} label="ใกล้เกิน SLA ภายใน 24 ชม." value={summary.attention.nearDue} tone="warning" />
        <AttentionCard icon={<PersonAddAltOutlined />} label="รอมอบหมายงาน" value={summary.attention.pendingAssignment} tone="info" />
        <AttentionCard icon={<FactCheckOutlined />} label="รอตรวจรับหรืออนุมัติ" value={summary.attention.pendingReview} tone="success" />
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.45fr) minmax(340px, .85fr)" }, gap: 3, alignItems: "start" }}>
        <Stack spacing={3}>
          <MainCard title={<Typography variant="h6">แนวโน้มรายการแจ้งซ่อม</Typography>} contentSx={{ pt: 2 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2, mb: 2.5 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">ตอบรับภายใน SLA</Typography>
                <Typography variant="h5" sx={{ mt: 0.35 }}>{summary.sla.responseOnTimeRate === null ? "–" : `${summary.sla.responseOnTimeRate}%`}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">ปิดงานภายใน SLA</Typography>
                <Typography variant="h5" sx={{ mt: 0.35 }}>{summary.sla.resolutionOnTimeRate === null ? "–" : `${summary.sla.resolutionOnTimeRate}%`}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">เวลาเฉลี่ยในการปิดงาน</Typography>
                <Typography variant="h5" sx={{ mt: 0.35 }}>{minutesLabel(summary.sla.averageResolutionMinutes)}</Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 1 }} />
            <DashboardChart
              type="bar"
              height={300}
              options={trendOptions}
              series={[
                { name: "รายการแจ้ง", data: summary.trend.map((item) => item.reported) },
                { name: "ปิดงานแล้ว", data: summary.trend.map((item) => item.completed) },
              ]}
            />
          </MainCard>

          <MainCard title={<Typography variant="h6">จุดพบปัญหาซ้ำ</Typography>} contentSx={{ p: 0 }}>
            {summary.hotspots.length ? summary.hotspots.map((item, index) => (
              <Box key={`${item.locationLabel}-${item.assetName ?? "area"}`} sx={{ display: "grid", gridTemplateColumns: "30px minmax(0, 1fr) auto", gap: 1.25, px: 2.5, py: 1.8, borderBottom: index === summary.hotspots.length - 1 ? 0 : 1, borderColor: "divider" }}>
                <Typography color="primary.main" sx={{ fontWeight: 700 }}>{index + 1}</Typography>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600 }} noWrap>{item.locationLabel}</Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>{item.assetName || "จุดพื้นที่"}</Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography sx={{ fontWeight: 700 }}>{item.count} ครั้ง</Typography>
                  <Typography variant="caption" color={item.openCount ? "warning.main" : "text.secondary"}>ค้าง {item.openCount} งาน</Typography>
                </Box>
              </Box>
            )) : <Typography color="text.secondary" sx={{ p: 3 }}>ยังไม่มีข้อมูลในช่วงเวลาที่เลือก</Typography>}
          </MainCard>
        </Stack>

        <Stack spacing={3}>
          <MainCard title={<Stack direction="row" spacing={1} sx={{ alignItems: "center" }}><FactCheckOutlined color="primary" /><Typography variant="h6">งานที่ต้องตัดสินใจ</Typography></Stack>} contentSx={{ p: 0 }}>
            {[...summary.attentionItems.unassigned.map((item) => ({ ...item, kind: "unassigned" as const })), ...summary.attentionItems.review.map((item) => ({ ...item, kind: "review" as const }))].length ? (
              [...summary.attentionItems.unassigned.map((item) => ({ ...item, kind: "unassigned" as const })), ...summary.attentionItems.review.map((item) => ({ ...item, kind: "review" as const }))].map((item, index, all) => (
                <Box key={`${item.kind}-${item.kind === "review" ? item.workOrderId : item.incidentId}`} component={Link} to={item.kind === "review" ? `/work-orders/${item.workOrderId}` : "/dispatch"} sx={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 1, px: 2.5, py: 1.75, color: "inherit", textDecoration: "none", borderBottom: index === all.length - 1 ? 0 : 1, borderColor: "divider", "&:hover": { bgcolor: "action.hover" } }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600 }} noWrap>{item.ticketNumber}</Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>{item.locationLabel}</Typography>
                  </Box>
                  <Stack spacing={0.5} sx={{ alignItems: "flex-end" }}>
                    <Chip size="small" label={item.kind === "unassigned" ? "รอมอบหมาย" : statusLabels[item.status] ?? item.status} color={item.kind === "unassigned" ? "info" : "warning"} variant="outlined" />
                    <OpenInNewOutlined fontSize="small" color="action" />
                  </Stack>
                </Box>
              ))
            ) : <Typography color="text.secondary" sx={{ p: 3 }}>ไม่มีงานที่รอตัดสินใจ</Typography>}
          </MainCard>

          <MainCard title={<Stack direction="row" spacing={1} sx={{ alignItems: "center" }}><EngineeringOutlined color="primary" /><Typography variant="h6">ภาระงานช่าง</Typography></Stack>} contentSx={{ p: 0 }}>
            {summary.technicianWorkload.length ? summary.technicianWorkload.map((item, index) => (
              <Box key={item.technicianId} sx={{ display: "flex", justifyContent: "space-between", gap: 2, px: 2.5, py: 1.7, borderBottom: index === summary.technicianWorkload.length - 1 ? 0 : 1, borderColor: "divider" }}>
                <Typography sx={{ fontWeight: 600 }}>{item.technicianName}</Typography>
                <Typography color={item.activeCount >= 5 ? "warning.main" : "text.secondary"}>{item.activeCount} งาน</Typography>
              </Box>
            )) : <Typography color="text.secondary" sx={{ p: 3 }}>ยังไม่มีช่างที่ได้รับอนุมัติในระบบ</Typography>}
          </MainCard>

          <MainCard title={<Stack direction="row" spacing={1} sx={{ alignItems: "center" }}><LocationOnOutlined color="primary" /><Typography variant="h6">สถานะงานในช่วงเวลา</Typography></Stack>}>
            <Box sx={{ display: "grid", gridTemplateColumns: "130px minmax(0, 1fr)", alignItems: "center", gap: 1 }}>
              <DashboardChart type="donut" height={180} options={statusOptions} series={summary.statusCounts.map((item) => item.count)} />
              <Stack spacing={1.15}>
                {summary.statusCounts.map((item) => <Stack key={item.status} direction="row" spacing={1} sx={{ justifyContent: "space-between" }}><Stack direction="row" spacing={0.8} sx={{ minWidth: 0, alignItems: "center" }}><Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: statusColors[item.status] ?? "text.secondary", flexShrink: 0 }} /><Typography variant="body2" noWrap>{statusLabels[item.status] ?? item.status}</Typography></Stack><Typography variant="body2" sx={{ fontWeight: 700 }}>{item.count}</Typography></Stack>)}
              </Stack>
            </Box>
          </MainCard>
        </Stack>
      </Box>
    </Stack>
  );
}
