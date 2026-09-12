import {
  AccessTimeOutlined,
  AddOutlined,
  AssignmentTurnedInOutlined,
  BuildOutlined,
  CalendarMonthOutlined,
  DescriptionOutlined,
  EngineeringOutlined,
  EventRepeatOutlined,
  HistoryOutlined,
  LocationOnOutlined,
  PersonOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { MainCard } from "../../components/base/MainCard";
import { useAuth } from "../../hooks/useAuth";
import { formatPMDate, getPMDueDetail } from "./pm.constants";
import { getPMSchedules } from "./pmApi";

const statusLabels = {
  draft: "ฉบับร่าง",
  active: "กำลังใช้งาน",
  paused: "พักชั่วคราว",
  completed: "สิ้นสุดแล้ว",
  cancelled: "ยกเลิกแผน",
} as const;

const statusColors = {
  draft: "default",
  active: "success",
  paused: "warning",
  completed: "info",
  cancelled: "default",
} as const;

function OverviewItem({
  icon,
  label,
  value,
  tone = "primary",
}: {
  icon: ReactNode;
  label: string;
  value: number;
  tone?: "primary" | "warning" | "success";
}) {
  const colors = {
    primary: { foreground: "#4B3B86", background: "rgba(75,59,134,0.09)" },
    warning: { foreground: "#B66A15", background: "rgba(198,138,46,0.11)" },
    success: { foreground: "#287557", background: "rgba(59,143,109,0.11)" },
  }[tone];

  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", minWidth: 0 }}>
      <Box
        sx={{
          width: 44,
          height: 44,
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          borderRadius: 1.75,
          color: colors.foreground,
          bgcolor: colors.background,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h5" sx={{ lineHeight: 1.25 }}>
          {value.toLocaleString("th-TH")} แผน
        </Typography>
      </Box>
    </Stack>
  );
}

function DateItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 0 }}>
      <Box
        sx={{
          width: 34,
          height: 34,
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          borderRadius: 1.25,
          color: "primary.main",
          bgcolor: "rgba(75,59,134,0.07)",
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography sx={{ fontWeight: 600, lineHeight: 1.4 }}>{value}</Typography>
      </Box>
    </Stack>
  );
}

export function PMSchedulesPage() {
  const { profile } = useAuth();
  const schedules = useQuery({
    queryKey: ["pm-schedules"],
    queryFn: getPMSchedules,
  });
  const isAdmin = profile?.role === "admin";
  const isTechnician = profile?.role === "technician";
  const items = schedules.data ?? [];
  const activeCount = items.filter((schedule) => schedule.status === "active").length;
  const attentionCount = items.filter((schedule) => {
    const due = getPMDueDetail(schedule);
    return schedule.status === "active" && (due.color === "warning" || due.color === "error");
  }).length;
  const unassignedCount = items.filter(
    (schedule) => schedule.status === "active" && !schedule.assignedTechnicianId,
  ).length;
  const orderedItems = [...items].sort((left, right) => {
    const attentionOrder = { error: 0, warning: 1, success: 2 } as const;
    const leftDue = getPMDueDetail(left);
    const rightDue = getPMDueDetail(right);
    const leftPriority = left.status === "active" ? attentionOrder[leftDue.color] : 3;
    const rightPriority = right.status === "active" ? attentionOrder[rightDue.color] : 3;
    return leftPriority - rightPriority || Date.parse(left.nextDueAt) - Date.parse(right.nextDueAt);
  });

  if (schedules.isLoading)
    return (
      <Box sx={{ minHeight: 320, display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Stack spacing={2.5}>
      <MainCard contentSx={{ p: 0 }} sx={{ overflow: "hidden" }}>
        <Box
          sx={{
            px: { xs: 2.25, md: 3.25 },
            py: { xs: 2.25, md: 2.75 },
            display: "flex",
            gap: 2,
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            background:
              "linear-gradient(118deg, rgba(75,59,134,0.11) 0%, rgba(156,121,223,0.05) 58%, rgba(255,255,255,0) 100%)",
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
                borderRadius: 2,
                color: "common.white",
                bgcolor: "primary.main",
                boxShadow: "0 8px 18px rgba(75,59,134,0.22)",
              }}
            >
              <BuildOutlined />
            </Box>
            <Box>
              <Typography variant="h3">แผนบำรุงรักษาเชิงป้องกัน</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.15 }}>
                ติดตามกำหนดการ ผู้รับผิดชอบ และผลการทำ PM ในที่เดียว
              </Typography>
            </Box>
          </Stack>
          {isAdmin && (
            <Button
              component={Link}
              to="/pm/new"
              variant="contained"
              startIcon={<AddOutlined />}
              sx={{ flexShrink: 0 }}
            >
              ตั้งรอบ PM
            </Button>
          )}
        </Box>
        <Box
          sx={{
            px: { xs: 2.25, md: 3.25 },
            py: 2,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
            gap: { xs: 1.5, md: 3 },
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <OverviewItem
            icon={<AssignmentTurnedInOutlined />}
            label="กำลังใช้งาน"
            value={activeCount}
            tone="success"
          />
          <OverviewItem
            icon={<AccessTimeOutlined />}
            label="ใกล้ถึงหรือเกินกำหนด"
            value={attentionCount}
            tone="warning"
          />
          <OverviewItem
            icon={<EngineeringOutlined />}
            label="ยังไม่มอบหมายช่าง"
            value={unassignedCount}
          />
        </Box>
      </MainCard>

      {schedules.isError && <Alert severity="error">ไม่สามารถโหลดแผน PM ได้</Alert>}
      {isAdmin && unassignedCount > 0 && (
        <Alert severity="warning" icon={<WarningAmberOutlined />}>
          มี {unassignedCount} แผนที่กำลังใช้งานแต่ยังไม่มอบหมายช่าง
          กรุณาเลือกผู้รับผิดชอบเพื่อให้ช่างเห็นงานและบันทึกผลได้
        </Alert>
      )}

      {!items.length && !schedules.isError && (
        <MainCard>
          <Stack spacing={1} sx={{ py: 4, alignItems: "center", textAlign: "center" }}>
            <CalendarMonthOutlined sx={{ fontSize: 48, color: "primary.light" }} />
            <Typography variant="h5">ยังไม่มีแผน PM</Typography>
            <Typography color="text.secondary">
              เริ่มสร้างรอบตรวจเพื่อวางแผนบำรุงรักษาครุภัณฑ์
            </Typography>
            {isAdmin && (
              <Button component={Link} to="/pm/new" variant="contained" startIcon={<AddOutlined />}>
                ตั้งรอบ PM แรก
              </Button>
            )}
          </Stack>
        </MainCard>
      )}

      <Stack spacing={2}>
        {orderedItems.map((schedule) => {
          const due = getPMDueDetail(schedule);
          const needsAttention =
            schedule.status === "active" && (due.color === "warning" || due.color === "error");
          return (
            <MainCard
              key={schedule.id}
              contentSx={{ p: 0 }}
              sx={{
                overflow: "hidden",
                borderLeft: 4,
                borderLeftColor: needsAttention
                  ? due.color === "error"
                    ? "error.main"
                    : "warning.main"
                  : schedule.status === "active"
                    ? "success.main"
                    : "divider",
              }}
            >
              <Box
                sx={{
                  px: { xs: 2, md: 2.75 },
                  py: 2,
                  display: "flex",
                  gap: 2,
                  alignItems: { xs: "flex-start", md: "center" },
                  justifyContent: "space-between",
                  flexDirection: { xs: "column", md: "row" },
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", minWidth: 0 }}>
                  <Box
                    sx={{
                      width: 46,
                      height: 46,
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                      borderRadius: 1.75,
                      color: "primary.main",
                      bgcolor: "rgba(75,59,134,0.08)",
                    }}
                  >
                    <BuildOutlined />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h5">{schedule.assetName}</Typography>
                    <Stack direction="row" spacing={0.5} sx={{ mt: 0.2, alignItems: "center" }}>
                      <LocationOnOutlined sx={{ fontSize: 17, color: "text.secondary" }} />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {schedule.locationLabel}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: "wrap" }}>
                  <Chip
                    size="small"
                    label={statusLabels[schedule.status]}
                    color={statusColors[schedule.status]}
                    variant="outlined"
                  />
                  <Chip size="small" color={due.color} label={due.label} />
                </Stack>
              </Box>

              <Box
                sx={{
                  px: { xs: 2, md: 2.75 },
                  py: 1.75,
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                    lg: "repeat(4, minmax(0, 1fr))",
                  },
                  gap: 2,
                  bgcolor: "rgba(75,59,134,0.025)",
                  borderTop: 1,
                  borderBottom: 1,
                  borderColor: "divider",
                }}
              >
                <DateItem
                  icon={<EventRepeatOutlined sx={{ fontSize: 19 }} />}
                  label="รอบตรวจ"
                  value={`ทุก ${schedule.intervalMonths} เดือน`}
                />
                <DateItem
                  icon={<HistoryOutlined sx={{ fontSize: 19 }} />}
                  label="ดำเนินการล่าสุด"
                  value={formatPMDate(schedule.lastDoneAt)}
                />
                <DateItem
                  icon={<CalendarMonthOutlined sx={{ fontSize: 19 }} />}
                  label="ครบกำหนดครั้งถัดไป"
                  value={formatPMDate(schedule.nextDueAt)}
                />
                <DateItem
                  icon={<AccessTimeOutlined sx={{ fontSize: 19 }} />}
                  label="สิ้นสุดแผน"
                  value={schedule.endAt ? formatPMDate(schedule.endAt) : "ไม่กำหนด"}
                />
              </Box>

              <Box
                sx={{
                  px: { xs: 2, md: 2.75 },
                  py: 2,
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", lg: "minmax(240px, 0.7fr) minmax(0, 1.3fr)" },
                  gap: 2,
                }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
                  <PersonOutlined color="primary" sx={{ mt: 0.15 }} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" color="text.secondary">
                      ช่างผู้รับผิดชอบ
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {schedule.assignedTechnicianName ?? "ยังไม่มอบหมาย"}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
                  <DescriptionOutlined color="primary" sx={{ mt: 0.15 }} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" color="text.secondary">
                      รายละเอียดแผน
                    </Typography>
                    <Typography sx={{ lineHeight: 1.55 }}>
                      {schedule.planDetails || "ยังไม่ได้ระบุรายละเอียดแผน"}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                sx={{
                  px: { xs: 2, md: 2.75 },
                  py: 1.5,
                  justifyContent: "flex-end",
                  bgcolor: "rgba(75,59,134,0.018)",
                  borderTop: 1,
                  borderColor: "divider",
                }}
              >
                {isTechnician && schedule.status === "active" && (
                  <Button
                    component={Link}
                    to={`/pm/${schedule.id}/complete`}
                    variant="contained"
                    startIcon={<BuildOutlined />}
                  >
                    บันทึกผล PM
                  </Button>
                )}
                {(isAdmin || isTechnician) && (
                  <Button
                    component={Link}
                    to={`/pm/${schedule.id}/complete`}
                    variant="outlined"
                    startIcon={<HistoryOutlined />}
                  >
                    รายละเอียดและประวัติ
                  </Button>
                )}
                {(isAdmin || isTechnician) && (
                  <Button component={Link} to={`/pm/${schedule.id}/edit`} variant="outlined">
                    แก้ไขแผน
                  </Button>
                )}
              </Stack>
            </MainCard>
          );
        })}
      </Stack>
    </Stack>
  );
}
