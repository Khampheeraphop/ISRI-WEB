import { TrendingDownOutlined, TrendingUpOutlined } from "@mui/icons-material";
import { Alert, Box, Stack, Typography, useTheme } from "@mui/material";
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
      contentSx={{ pt: { xs: 2.5, md: 2.75 } }}
    >
      {error ? (
        <Alert severity="error">{error.message}</Alert>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "minmax(230px, .72fr) minmax(0, 1.28fr)",
            },
            gap: { xs: 2.5, md: 4 },
            alignItems: "end",
          }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary">
              เดือน{current.month ? monthLabel(current.month) : "ปัจจุบัน"}
            </Typography>
            <Typography
              variant="h1"
              color="primary.main"
              sx={{
                mt: 0.25,
                fontSize: { xs: "2.7rem", md: "3.15rem" },
                lineHeight: 1.05,
              }}
            >
              {current.count.toLocaleString("th-TH")}{" "}
              <Box
                component="span"
                sx={{ fontSize: "0.52em", fontWeight: 600 }}
              >
                เคส
              </Box>
            </Typography>
            <Stack
              direction="row"
              spacing={0.75}
              sx={{ alignItems: "center", mt: 1, color: changeColor }}
            >
              <ChangeIcon fontSize="small" />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {change === null
                  ? previous.count === 0 && current.count > 0
                    ? "เริ่มมีการแจ้งเหตุในเดือนนี้"
                    : "ไม่มีรายการแจ้งเหตุใน 2 เดือนล่าสุด"
                  : `${change >= 0 ? "+" : ""}${Math.round(change)}% จากเดือนก่อน (${previous.count.toLocaleString("th-TH")} เคส)`}
              </Typography>
            </Stack>
          </Box>
          <Box sx={{ height: 80, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 2, left: 2, bottom: 0 }}
              >
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: theme.palette.text.secondary,
                    fontFamily: theme.typography.fontFamily,
                    fontSize: 12,
                  }}
                  dy={5}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    borderColor: theme.palette.divider,
                    borderRadius: 8,
                    fontFamily: theme.typography.fontFamily,
                  }}
                  formatter={(value) => [`${value ?? 0} เคส`, "รายการแจ้ง"]}
                  labelFormatter={(label) => `เดือน${label}`}
                />
                <Bar dataKey="count" radius={[4, 4, 1, 1]} maxBarSize={34}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={entry.month}
                      fill={
                        index === chartData.length - 1
                          ? theme.palette.primary.main
                          : theme.palette.divider
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
