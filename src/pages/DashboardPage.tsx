import { DownloadOutlined } from "@mui/icons-material";
import {
  Box,
  Button,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import type { ApexOptions } from "apexcharts";
import { useState } from "react";
import Chart from "react-apexcharts";
import { Link } from "react-router-dom";
import { MainCard } from "../components/base/MainCard";
import { useEntityQuery } from "../hooks/useEntity";
import type { IncidentStatus } from "../types/incident";

type StatusFilter = IncidentStatus | "all";

const statusLabels: Record<IncidentStatus, string> = {
  submitted: "รับแจ้งแล้ว",
  assigned: "มอบหมายงานแล้ว",
  in_progress: "กำลังดำเนินการ",
  waiting_parts: "รอชิ้นส่วน",
  done: "เสร็จสิ้น",
};

const statusColors: Record<IncidentStatus, string> = {
  submitted: "#6B5AA6",
  assigned: "#647FA8",
  in_progress: "#C68A2E",
  waiting_parts: "#9A80A8",
  done: "#3B8F6D",
};

const monthFormatter = new Intl.DateTimeFormat("th-TH", { month: "short" });
const dateFormatter = new Intl.DateTimeFormat("th-TH", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function downloadCsv(content: string) {
  const url = URL.createObjectURL(
    new Blob(["\uFEFF", content], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "isri-incidents.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export function DashboardPage() {
  const incidents = useEntityQuery("incidents");
  const workOrders = useEntityQuery("workOrders");
  const [rangeMonths, setRangeMonths] = useState(6);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const data = incidents.data ?? [];
  const orders = workOrders.data ?? [];
  const now = new Date();
  const filteredIncidents = data.filter(
    (item) => statusFilter === "all" || item.status === statusFilter,
  );
  const activeStatuses: IncidentStatus[] = [
    "assigned",
    "in_progress",
    "waiting_parts",
  ];
  const activeIncidents = filteredIncidents.filter((item) =>
    activeStatuses.includes(item.status),
  );
  const doneOrders = orders.filter((order) => order.status === "done");
  const slaSuccess = doneOrders.filter(
    (order) =>
      (order.statusHistory.find((item) => item.status === "done")?.changedAt ??
        "") <= order.resolveDueAt,
  ).length;
  const overdueOrders = orders.filter(
    (order) => order.status !== "done" && new Date(order.resolveDueAt) < now,
  );
  const submittedCount = data.filter(
    (item) => item.status === "submitted",
  ).length;
  const locationCounts = new Map<string, number>();
  data.forEach((incident) => {
    locationCounts.set(
      incident.locationLabel,
      (locationCounts.get(incident.locationLabel) ?? 0) + 1,
    );
  });
  const repeatedLocation = [...locationCounts.entries()].sort(
    (a, b) => b[1] - a[1],
  )[0];
  const trend = Array.from({ length: rangeMonths }, (_, index) => {
    const monthDate = new Date(
      now.getFullYear(),
      now.getMonth() - (rangeMonths - 1 - index),
      1,
    );
    const month = monthDate.getMonth();
    const year = monthDate.getFullYear();
    const incidentsInMonth = filteredIncidents.filter((item) => {
      const createdAt = new Date(item.createdAt);
      return createdAt.getFullYear() === year && createdAt.getMonth() === month;
    });
    return {
      month: monthFormatter.format(monthDate),
      incidents: incidentsInMonth.length,
      completed: incidentsInMonth.filter((item) => item.status === "done")
        .length,
    };
  });
  const statusSummary = (Object.keys(statusLabels) as IncidentStatus[]).map(
    (status) => ({
      status,
      label: statusLabels[status],
      count: data.filter((item) => item.status === status).length,
    }),
  );
  const visibleStatusSummary = statusSummary.filter((item) => item.count > 0);
  const latestIncidents = filteredIncidents
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);
  const trendOptions: ApexOptions = {
    chart: {
      fontFamily: "Anuphan, sans-serif",
      toolbar: { show: false },
    },
    colors: ["#4B3B86", "#AAA2C5"],
    plotOptions: { bar: { borderRadius: 3, columnWidth: "40%" } },
    dataLabels: { enabled: false },
    grid: {
      borderColor: "#E4E1ED",
      strokeDashArray: 3,
      padding: { left: 4, right: 8 },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontFamily: "Anuphan, sans-serif",
      fontSize: "13px",
      markers: { size: 7 },
    },
    xaxis: {
      categories: trend.map((item) => item.month),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: "#756E88", fontFamily: "Anuphan, sans-serif" },
      },
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      labels: {
        style: { colors: "#756E88", fontFamily: "Anuphan, sans-serif" },
      },
    },
    tooltip: { y: { formatter: (value) => `${value} รายการ` } },
  };
  const statusOptions: ApexOptions = {
    chart: { fontFamily: "Anuphan, sans-serif", toolbar: { show: false } },
    labels: visibleStatusSummary.map((item) => item.label),
    colors: visibleStatusSummary.map((item) => statusColors[item.status]),
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { colors: ["#FFFFFF"], width: 3 },
    plotOptions: {
      pie: {
        donut: {
          size: "67%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "รายการทั้งหมด",
              fontFamily: "Anuphan, sans-serif",
              formatter: () => data.length.toLocaleString("th-TH"),
            },
          },
        },
      },
    },
    tooltip: { y: { formatter: (value) => `${value} รายการ` } },
  };
  const exportIncidents = () =>
    downloadCsv(
      [
        "เลขที่ใบแจ้งเหตุ,ตำแหน่ง,ชิ้นงาน,ประเภทปัญหา,ระดับความเร่งด่วน,สถานะ,วันที่แจ้ง",
        ...data.map((item) =>
          [
            item.ticketNumber,
            item.locationLabel,
            item.assetName ?? "",
            item.category,
            item.urgencyReported,
            statusLabels[item.status],
            item.createdAt,
          ]
            .map((value) => `"${String(value).replaceAll('"', '""')}"`)
            .join(","),
        ),
      ].join("\n"),
    );

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="body2" color="primary.main" sx={{ mb: 0.5 }}>
          ภาพรวม
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
          }}
        >
          <Typography variant="h3">ภาพรวมระบบ</Typography>
          <Button
            variant="outlined"
            startIcon={<DownloadOutlined />}
            onClick={exportIncidents}
          >
            ส่งออก CSV
          </Button>
        </Box>
      </Box>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
        <FormControl size="small" sx={{ minWidth: { sm: 190 } }}>
          <InputLabel id="dashboard-range-label">ช่วงเวลา</InputLabel>
          <Select
            labelId="dashboard-range-label"
            label="ช่วงเวลา"
            value={rangeMonths}
            onChange={(event) => setRangeMonths(Number(event.target.value))}
          >
            <MenuItem value={3}>3 เดือนล่าสุด</MenuItem>
            <MenuItem value={6}>6 เดือนล่าสุด</MenuItem>
            <MenuItem value={12}>12 เดือนล่าสุด</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: { sm: 190 } }}>
          <InputLabel id="dashboard-status-label">สถานะรายการ</InputLabel>
          <Select
            labelId="dashboard-status-label"
            label="สถานะรายการ"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as StatusFilter)
            }
          >
            <MenuItem value="all">ทุกสถานะ</MenuItem>
            {(Object.keys(statusLabels) as IncidentStatus[]).map((status) => (
              <MenuItem key={status} value={status}>
                {statusLabels[status]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 360px" },
          gap: 3,
          alignItems: "start",
        }}
      >
        <Stack spacing={3}>
          <MainCard
            title={<Typography variant="h6">สถิติการแจ้งซ่อม</Typography>}
            contentSx={{ pt: 2.25 }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="body2" color="text.secondary">
                  รายการแจ้งทั้งหมด
                </Typography>
                <Typography variant="h4" sx={{ mt: 0.45 }}>
                  {filteredIncidents.length.toLocaleString("th-TH")} รายการ
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  อยู่ระหว่างดำเนินการ
                </Typography>
                <Typography variant="h4" sx={{ mt: 0.45 }}>
                  {activeIncidents.length.toLocaleString("th-TH")} รายการ
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  ปิดงานตาม SLA
                </Typography>
                <Typography variant="h4" sx={{ mt: 0.45 }}>
                  {doneOrders.length
                    ? `${Math.round((slaSuccess / doneOrders.length) * 100)}%`
                    : "–"}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2.5 }} />
            <Chart
              type="bar"
              height={310}
              options={trendOptions}
              series={[
                {
                  name: "รายการแจ้ง",
                  data: trend.map((item) => item.incidents),
                },
                {
                  name: "ปิดงานแล้ว",
                  data: trend.map((item) => item.completed),
                },
              ]}
            />
          </MainCard>

          <MainCard
            title={<Typography variant="h6">สถานะรายการแจ้งซ่อม</Typography>}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "360px minmax(0, 1fr)" },
                gap: { xs: 2.5, md: 4 },
                alignItems: "center",
              }}
            >
              <Chart
                type="donut"
                height={280}
                options={statusOptions}
                series={visibleStatusSummary.map((item) => item.count)}
              />
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 1.5,
                }}
              >
                {statusSummary.map((item) => (
                  <Box
                    key={item.status}
                    sx={{ p: 1.75, bgcolor: "#F7F6FA", borderRadius: 1.25 }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: "center" }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: statusColors[item.status],
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {item.label}
                      </Typography>
                    </Stack>
                    <Typography variant="h5" sx={{ mt: 0.8 }}>
                      {item.count.toLocaleString("th-TH")}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </MainCard>
        </Stack>

        <Stack spacing={3}>
          <MainCard
            title={<Typography variant="h6">รายการที่ต้องติดตาม</Typography>}
            contentSx={{ p: 0 }}
          >
            <Stack divider={<Divider flexItem />}>
              <Box sx={{ px: 3, py: 2.25 }}>
                <Typography variant="body2" color="text.secondary">
                  งานเกินเวลาที่กำหนด
                </Typography>
                <Typography variant="h5" sx={{ mt: 0.5 }}>
                  {overdueOrders.length.toLocaleString("th-TH")} งาน
                </Typography>
              </Box>
              <Box sx={{ px: 3, py: 2.25 }}>
                <Typography variant="body2" color="text.secondary">
                  รายการรอรับแจ้ง
                </Typography>
                <Typography variant="h5" sx={{ mt: 0.5 }}>
                  {submittedCount.toLocaleString("th-TH")} รายการ
                </Typography>
              </Box>
              <Box sx={{ px: 3, py: 2.25 }}>
                <Typography variant="body2" color="text.secondary">
                  จุดพบปัญหาซ้ำ
                </Typography>
                <Typography sx={{ fontWeight: 600, mt: 0.5 }}>
                  {repeatedLocation ? repeatedLocation[0] : "ยังไม่มีข้อมูล"}
                </Typography>
                {repeatedLocation && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.2 }}
                  >
                    {repeatedLocation[1]} รายการแจ้ง
                  </Typography>
                )}
              </Box>
            </Stack>
          </MainCard>

          <MainCard
            title={<Typography variant="h6">รายการแจ้งล่าสุด</Typography>}
            contentSx={{ p: 0 }}
          >
            <Stack divider={<Divider flexItem />}>
              {latestIncidents.map((item, index) => (
                <Box
                  key={item.id}
                  component={Link}
                  to={`/incidents/${item.id}`}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "24px minmax(0, 1fr) auto",
                    gap: 1,
                    px: 3,
                    py: 2,
                    color: "inherit",
                    textDecoration: "none",
                    alignItems: "start",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <Typography color="primary.main">{index + 1}</Typography>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600 }} noWrap>
                      {item.locationLabel}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {item.ticketNumber} · {item.category}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    {dateFormatter.format(new Date(item.createdAt))}
                  </Typography>
                </Box>
              ))}
              {!latestIncidents.length && (
                <Typography color="text.secondary" sx={{ p: 3 }}>
                  ยังไม่มีรายการแจ้งในระบบ
                </Typography>
              )}
            </Stack>
          </MainCard>
        </Stack>
      </Box>
    </Stack>
  );
}
