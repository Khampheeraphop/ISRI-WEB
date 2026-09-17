import { TrendingDownOutlined, TrendingUpOutlined } from "@mui/icons-material";
import { Alert, Box, Typography, useTheme } from "@mui/material";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { MainCard } from "../../components/base/MainCard";
import type { MonthlyReportingCount } from "./dashboardApi";

const thaiMonth = new Intl.DateTimeFormat("th-TH", { month: "short" });

function monthLabel(month: string) {
  return thaiMonth.format(new Date(`${month}-01T00:00:00Z`));
}

export function ReportingRateCard({
  data,
  error,
}: {
  data?: MonthlyReportingCount[];
  error?: Error | null;
}) {
  const theme = useTheme();
  const current = data?.at(-1) ?? { month: "", count: 0 };
  const previous = data?.at(-2) ?? { month: "", count: 0 };
  const change = previous.count
    ? ((current.count - previous.count) / previous.count) * 100
    : null;
  const isPositive = change === null || change >= 0;
  const changeColor = isPositive ? "success.main" : "warning.main";
  const ChangeIcon = isPositive ? TrendingUpOutlined : TrendingDownOutlined;
  const chartData = (data ?? []).map((item) => ({
    ...item,
    label: monthLabel(item.month),
  }));

  return (
    <MainCard
      title={<Typography variant="h6">จำนวนการแจ้งเหตุรายเดือน</Typography>}
      subheader="จำนวนเหตุที่มีการแจ้งผ่านระบบใน 6 เดือนย้อนหลัง"
      contentSx={{ pt: { xs: 2.5, md: 3 } }}
    >
      {error ? (
        <Alert severity="error">{error.message}</Alert>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "240px minmax(0, 1fr)",
            },
            gap: { xs: 2.5, md: 3.5 },
            alignItems: "center",
          }}
        >
          {/* KPI Display */}
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              เดือน{current.month ? monthLabel(current.month) : "ปัจจุบัน"}
            </Typography>
            <Typography
              variant="h2"
              color="primary.main"
              sx={{
                mt: 0.5,
                fontWeight: 700,
                fontSize: { xs: "2.5rem", md: "3rem" },
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              {current.count.toLocaleString("th-TH")}{" "}
              <Box
                component="span"
                sx={{
                  fontSize: "0.45em",
                  fontWeight: 600,
                  color: "text.secondary",
                  ml: 0.5,
                }}
              >
                เคส
              </Box>
            </Typography>

            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.75,
                mt: 1.5,
                px: 1.25,
                py: 0.5,
                borderRadius: 1.5,
                bgcolor: isPositive
                  ? "rgba(59, 143, 109, 0.08)"
                  : "rgba(198, 138, 46, 0.08)",
                color: changeColor,
              }}
            >
              <ChangeIcon sx={{ fontSize: 18 }} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {change === null
                  ? previous.count === 0 && current.count > 0
                    ? "เริ่มมีการแจ้งเหตุในเดือนนี้"
                    : "ไม่มีรายการแจ้งเหตุใน 2 เดือนล่าสุด"
                  : `${change >= 0 ? "+" : ""}${Math.round(change)}% จากเดือนก่อน (${previous.count.toLocaleString("th-TH")} เคส)`}
              </Typography>
            </Box>
          </Box>

          {/* Bar Chart */}
          <Box sx={{ height: 140, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
              >
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: theme.palette.text.secondary,
                    fontFamily: theme.typography.fontFamily,
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                  dy={6}
                />
                <Tooltip
                  cursor={{ fill: "rgba(75, 59, 134, 0.04)", radius: 4 }}
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    borderColor: theme.palette.divider,
                    borderRadius: 8,
                    boxShadow: "0px 4px 16px rgba(75, 59, 134, 0.1)",
                    fontFamily: theme.typography.fontFamily,
                    fontSize: "0.875rem",
                  }}
                  formatter={(value) => [`${value ?? 0} เคส`, "รายการแจ้ง"]}
                  labelFormatter={(label) => `เดือน${label}`}
                />
                <Bar dataKey="count" radius={[5, 5, 0, 0]} maxBarSize={38}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={entry.month}
                      fill={
                        index === chartData.length - 1
                          ? theme.palette.primary.main
                          : "#DDD6EC"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      )}
    </MainCard>
  );
}
