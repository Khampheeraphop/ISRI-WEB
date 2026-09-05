import {
  AssignmentLateOutlined,
  HourglassTopOutlined,
  LocationOnOutlined,
  PersonAddAltOutlined,
} from "@mui/icons-material";
import {
  Box,
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
import { MainCard } from "../components/base/MainCard";
import {
  getDashboardSummary,
  getMonthlyReportingCounts,
} from "../features/dashboard/dashboardApi";
import { ReportingRateCard } from "../features/dashboard/ReportingRateCard";
import { TechnicianWorkloadCard } from "../features/dashboard/TechnicianWorkloadCard";
import { IncentiveOverviewCard } from "../features/dashboard/IncentiveOverviewCard";
import { HotspotCard } from "../features/dashboard/HotspotCard";
import { PmDueOverviewCard } from "../features/dashboard/PmDueOverviewCard";

const DashboardChart = lazy(() => import("react-apexcharts"));

const statusLabels: Record<string, string> = {
  submitted: "รอตรวจสอบ",
  pending_assignment: "รอตรวจสอบ",
  assigned: "รอช่างรับงาน",
  in_progress: "กำลังดำเนินการซ่อม",
  pending_parts_approval: "รออนุมัติเบิกอะไหล่",
  waiting_parts: "รออะไหล่",
  pending_repair_approval: "รอตรวจรับงานซ่อม",
  done: "ปิดงาน",
  rejected: "ไม่รับรายการ",
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
  rejected: "#C1443A",
};

const thaiDateTime = new Intl.DateTimeFormat("th-TH", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Bangkok",
});
const months = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];
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
  tone: "error" | "warning" | "info";
}) {
  const color =
    tone === "error"
      ? "error.main"
      : tone === "warning"
        ? "warning.main"
        : "info.main";
  return (
    <Box
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
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const currentYear = Number(today.find((part) => part.type === "year")!.value);
  const currentMonth = Number(
    today.find((part) => part.type === "month")!.value,
  );
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const periodMonth = `${year}-${String(month).padStart(2, "0")}`;
  const summaryQuery = useQuery({
    queryKey: ["dashboard-summary", periodMonth],
    queryFn: () => getDashboardSummary(periodMonth),
  });
  const reportingRateQuery = useQuery({
    queryKey: ["monthly-reporting-counts", periodMonth],
    queryFn: () => getMonthlyReportingCounts(periodMonth),
  });
  const summary = summaryQuery.data;

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

  if (summaryQuery.isLoading || reportingRateQuery.isLoading)
    return <DashboardLoading />;
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
            สรุปข้อมูลเดือน{months[month - 1]} {year + 543} · อัปเดต{" "}
            {thaiDateTime.format(new Date(summary.generatedAt))} น.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.25}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="dashboard-month">เดือน</InputLabel>
            <Select
              labelId="dashboard-month"
              label="เดือน"
              value={month}
              onChange={(event) => setMonth(Number(event.target.value))}
            >
              {months.map((label, index) => (
                <MenuItem
                  key={label}
                  value={index + 1}
                  disabled={year === currentYear && index + 1 > currentMonth}
                >
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 118 }}>
            <InputLabel id="dashboard-year">ปี</InputLabel>
            <Select
              labelId="dashboard-year"
              label="ปี"
              value={year}
              onChange={(event) => {
                const value = Number(event.target.value);
                setYear(value);
                if (value === currentYear && month > currentMonth)
                  setMonth(currentMonth);
              }}
            >
              {[currentYear, currentYear - 1, currentYear - 2].map((item) => (
                <MenuItem key={item} value={item}>
                  {item + 543}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mt: -1.5 }}>
        สถิติรายงานและ KPI ใช้เดือนที่เลือก ส่วนงานค้างและกำหนดแผน PM
        แสดงสถานะปัจจุบัน
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(3, minmax(0, 1fr))",
          },
          gap: 2,
        }}
      >
        <AttentionCard
          icon={<AssignmentLateOutlined />}
          label="เกิน SLA"
          value={summary.attention.overdue}
          tone="error"
        />
        <AttentionCard
          icon={<HourglassTopOutlined />}
          label="ใกล้เกิน SLA ภายใน 24 ชม."
          value={summary.attention.nearDue}
          tone="warning"
        />
        <AttentionCard
          icon={<PersonAddAltOutlined />}
          label="รอมอบหมายงาน"
          value={summary.attention.pendingAssignment}
          tone="info"
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "minmax(0, 1.45fr) minmax(340px, .85fr)",
          },
          gap: 3,
          alignItems: "start",
        }}
      >
        <Stack spacing={3}>
          <ReportingRateCard
            data={reportingRateQuery.data}
            error={
              reportingRateQuery.error instanceof Error
                ? reportingRateQuery.error
                : null
            }
          />
          <MainCard
            title={
              <Typography variant="h6">ประสิทธิภาพการดำเนินงาน</Typography>
            }
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  lg: "repeat(4, 1fr)",
                },
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="body2" color="text.secondary">
                  ตอบรับภายใน SLA
                </Typography>
                <Typography variant="h5" sx={{ mt: 0.35 }}>
                  {summary.sla.responseOnTimeRate === null
                    ? "–"
                    : `${summary.sla.responseOnTimeRate}%`}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  เวลาเฉลี่ยในการตอบรับ
                </Typography>
                <Typography variant="h5" sx={{ mt: 0.35 }}>
                  {minutesLabel(summary.sla.averageResponseMinutes)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  ปิดงานภายใน SLA
                </Typography>
                <Typography variant="h5" sx={{ mt: 0.35 }}>
                  {summary.sla.resolutionOnTimeRate === null
                    ? "–"
                    : `${summary.sla.resolutionOnTimeRate}%`}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  เวลาเฉลี่ยในการปิดงาน
                </Typography>
                <Typography variant="h5" sx={{ mt: 0.35 }}>
                  {minutesLabel(
                    summary.sla.averageClosureMinutes ??
                      summary.sla.averageResolutionMinutes ??
                      null,
                  )}
                </Typography>
              </Box>
            </Box>
          </MainCard>

          <HotspotCard data={summary} />
          <IncentiveOverviewCard data={summary.incentives} />
        </Stack>

        <Stack spacing={3}>
          <MainCard
            title={
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <LocationOnOutlined color="primary" />
                <Typography variant="h6">สถานะงานในช่วงเวลา</Typography>
              </Stack>
            }
            subheader="ภาพรวมสถานะของรายการที่แจ้งในเดือนที่เลือก"
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "130px minmax(0, 1fr)" },
                alignItems: "center",
                gap: 1,
              }}
            >
              {summary.statusCounts.some((item) => item.count > 0) ? (
                <DashboardChart
                  type="donut"
                  height={180}
                  options={statusOptions}
                  series={summary.statusCounts.map((item) => item.count)}
                />
              ) : (
                <Typography color="text.secondary">
                  ไม่มีรายการแจ้งในเดือนที่เลือก
                </Typography>
              )}
              <Stack spacing={1.15}>
                {summary.statusCounts.map((item) => (
                  <Stack
                    key={item.status}
                    direction="row"
                    spacing={1}
                    sx={{ justifyContent: "space-between" }}
                  >
                    <Stack
                      direction="row"
                      spacing={0.8}
                      sx={{ minWidth: 0, alignItems: "center" }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor:
                            statusColors[item.status] ?? "text.secondary",
                          flexShrink: 0,
                        }}
                      />
                      <Typography variant="body2">
                        {statusLabels[item.status] ?? item.status}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {item.count} (
                      {Math.round(
                        (item.count /
                          (summary.statusCounts.reduce(
                            (total, row) => total + row.count,
                            0,
                          ) || 1)) *
                          100,
                      )}
                      %)
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </MainCard>
          <TechnicianWorkloadCard data={summary.technicianWorkload} />
        </Stack>
      </Box>

      <PmDueOverviewCard data={summary.pm} />
    </Stack>
  );
}
