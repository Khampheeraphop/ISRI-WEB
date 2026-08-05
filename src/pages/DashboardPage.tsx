import {
  DownloadOutlined,
  FactCheckOutlined,
  ReportProblemOutlined,
  RoomOutlined,
} from "@mui/icons-material";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import type { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";
import { MainCard } from "../components/base/MainCard";
import { useEntityQuery } from "../hooks/useEntity";

const monthFormatter = new Intl.DateTimeFormat("th-TH", { month: "short" });
const incidentStatusLabel = {
  submitted: "รับแจ้งแล้ว",
  assigned: "มอบหมายงานแล้ว",
  in_progress: "กำลังดำเนินการ",
  waiting_parts: "รอชิ้นส่วน",
  done: "เสร็จสิ้น",
} as const;
const downloadCsv = (content: string) => {
  const url = URL.createObjectURL(
    new Blob(["\uFEFF", content], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "isri-incidents.csv";
  link.click();
  URL.revokeObjectURL(url);
};

export function DashboardPage() {
  const incidents = useEntityQuery("incidents");
  const workOrders = useEntityQuery("workOrders");
  const data = incidents.data ?? [];
  const orders = workOrders.data ?? [];
  const locationCounts = new Map<string, number>();
  data.forEach((incident) =>
    locationCounts.set(
      incident.locationLabel,
      (locationCounts.get(incident.locationLabel) ?? 0) + 1,
    ),
  );
  const repeatedLocation = [...locationCounts.entries()].sort(
    (a, b) => b[1] - a[1],
  )[0];
  const doneOrders = orders.filter((order) => order.status === "done");
  const slaSuccess = doneOrders.filter(
    (order) =>
      (order.statusHistory.find((item) => item.status === "done")?.changedAt ??
        "") <= order.resolveDueAt,
  ).length;
  const trend = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    const month = date.getMonth();
    const year = date.getFullYear();
    return {
      month: monthFormatter.format(date),
      total: data.filter((item) => {
        const itemDate = new Date(item.createdAt);
        return itemDate.getMonth() === month && itemDate.getFullYear() === year;
      }).length,
    };
  });
  const chartOptions: ApexOptions = {
    chart: { toolbar: { show: false }, fontFamily: "Anuphan, sans-serif" },
    colors: ["#4B3B86"],
    plotOptions: { bar: { borderRadius: 4, columnWidth: "44%" } },
    dataLabels: { enabled: false },
    grid: { borderColor: "#E4E1ED", strokeDashArray: 3 },
    xaxis: {
      categories: trend.map((item) => item.month),
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { min: 0, forceNiceScale: true },
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
            item.status,
            item.createdAt,
          ]
            .map((value) => `"${String(value).replaceAll('"', '""')}"`)
            .join(","),
        ),
      ].join("\n"),
    );
  const summary = [
    {
      title: "เรื่องแจ้งทั้งหมด",
      value: data.length.toLocaleString("th-TH"),
      detail: "รวมทุกรายการในระบบ",
      icon: <ReportProblemOutlined />,
      color: "primary.main",
    },
    {
      title: "ทำ SLA สำเร็จ",
      value: doneOrders.length
        ? `${Math.round((slaSuccess / doneOrders.length) * 100)}%`
        : "–",
      detail: doneOrders.length
        ? `${slaSuccess} จาก ${doneOrders.length} งานที่เสร็จ`
        : "ยังไม่มีงานที่ปิดแล้ว",
      icon: <FactCheckOutlined />,
      color: "success.main",
    },
    {
      title: "จุดพบปัญหาซ้ำ",
      value: repeatedLocation?.[0] ?? "–",
      detail: repeatedLocation
        ? `${repeatedLocation[1]} รายการแจ้ง`
        : "ยังไม่มีข้อมูล",
      icon: <RoomOutlined />,
      color: "warning.main",
    },
  ];
  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Box>
          <Typography variant="h3">ภาพรวมการดำเนินงาน</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            สรุปสถานะการแจ้งซ่อมและแนวโน้มเพื่อใช้วางแผน
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<DownloadOutlined />}
          onClick={exportIncidents}
        >
          ส่งออก CSV
        </Button>
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
          gap: 2,
        }}
      >
        {summary.map((item) => (
          <MainCard key={item.title} contentSx={{ p: 2.5 }}>
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ alignItems: "flex-start" }}
            >
              <Box
                sx={{
                  display: "grid",
                  placeItems: "center",
                  width: 42,
                  height: 42,
                  bgcolor: "background.default",
                  color: item.color,
                  borderRadius: 1.5,
                }}
              >
                {item.icon}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" color="text.secondary">
                  {item.title}
                </Typography>
                <Typography
                  variant={item.title === "จุดพบปัญหาซ้ำ" ? "h6" : "h3"}
                  sx={{ mt: 0.3 }}
                  noWrap
                >
                  {item.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.detail}
                </Typography>
              </Box>
            </Stack>
          </MainCard>
        ))}
      </Box>
      <MainCard
        title={<Typography variant="h5">แนวโน้มรายการแจ้งรายเดือน</Typography>}
        subheader="จำนวนรายการแจ้งที่บันทึกในแต่ละเดือน"
      >
        <Box sx={{ width: "100%", minHeight: 320 }}>
          <Chart
            type="bar"
            height={320}
            options={chartOptions}
            series={[
              { name: "รายการแจ้ง", data: trend.map((item) => item.total) },
            ]}
          />
        </Box>
      </MainCard>
      <MainCard title={<Typography variant="h5">รายการล่าสุด</Typography>}>
        <Stack spacing={1}>
          {data
            .slice()
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .slice(0, 5)
            .map((item) => (
              <Stack
                key={item.id}
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                sx={{
                  py: 1,
                  borderBottom: 1,
                  borderColor: "divider",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>
                    {item.ticketNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.locationLabel} · {item.category}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  variant="outlined"
                  label={incidentStatusLabel[item.status]}
                  sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
                />
              </Stack>
            ))}
        </Stack>
      </MainCard>
    </Stack>
  );
}
