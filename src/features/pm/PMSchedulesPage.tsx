import {
  AddOutlined,
  BuildOutlined,
  CalendarMonthOutlined,
  HistoryOutlined,
  PersonOutlined,
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
import { Link } from "react-router-dom";
import { MainCard } from "../../components/base/MainCard";
import { useAuth } from "../../hooks/useAuth";
import { formatPMDate, getPMDueDetail } from "./pm.constants";
import { getPMSchedules } from "./pmApi";

export function PMSchedulesPage() {
  const { profile } = useAuth();
  const schedules = useQuery({
    queryKey: ["pm-schedules"],
    queryFn: getPMSchedules,
  });
  const isAdmin = profile?.role === "admin";
  const isTechnician = profile?.role === "technician";

  if (schedules.isLoading)
    return (
      <Box sx={{ minHeight: 320, display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );

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
          <Typography variant="h3">แผนบำรุงรักษาเชิงป้องกัน</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            ติดตามรอบตรวจเช็คครุภัณฑ์และบันทึกผลการทำ PM
          </Typography>
        </Box>
        {isAdmin && (
          <Button
            component={Link}
            to="/pm/new"
            variant="contained"
            startIcon={<AddOutlined />}
          >
            ตั้งรอบ PM
          </Button>
        )}
      </Box>
      {schedules.isError && (
        <Alert severity="error">ไม่สามารถโหลดแผน PM ได้</Alert>
      )}
      {isAdmin &&
        schedules.data?.some((schedule) => !schedule.assignedTechnicianId) && (
          <Alert severity="warning">
            มี{" "}
            {
              schedules.data.filter(
                (schedule) => !schedule.assignedTechnicianId,
              ).length
            }{" "}
            แผนที่ยังไม่มอบหมายช่าง กรุณาแก้ไขแผนและเลือกผู้รับผิดชอบ
            เพื่อให้ช่างเห็นงานและบันทึกผลได้
          </Alert>
        )}
      {!schedules.data?.length && !schedules.isError && (
        <MainCard>
          <Typography color="text.secondary">ยังไม่มีแผน PM ในระบบ</Typography>
        </MainCard>
      )}
      <Stack spacing={2}>
        {(schedules.data ?? []).map((schedule) => {
          const due = getPMDueDetail(schedule);
          return (
            <MainCard
              key={schedule.id}
              title={<Typography variant="h5">{schedule.assetName}</Typography>}
              subheader={schedule.locationLabel}
              action={
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center" }}
                >
                  {schedule.assignedTechnicianName ? (
                    <Chip
                      size="small"
                      icon={<PersonOutlined />}
                      label={schedule.assignedTechnicianName}
                      color="primary"
                      variant="outlined"
                    />
                  ) : (
                    <Chip
                      size="small"
                      label="ยังไม่มอบหมายช่าง"
                      variant="outlined"
                      color="default"
                    />
                  )}
                  <Chip
                    size="small"
                    color={due.color}
                    variant="outlined"
                    label={due.label}
                  />
                </Stack>
              }
              footer={
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  sx={{ width: "100%", justifyContent: "flex-end" }}
                >
                  {isTechnician && (
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
                      รายละเอียด / ประวัติ
                    </Button>
                  )}
                  {(isAdmin || isTechnician) && (
                    <Button
                      component={Link}
                      to={`/pm/${schedule.id}/edit`}
                      variant="outlined"
                    >
                      แก้ไขแผน
                    </Button>
                  )}
                </Stack>
              }
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 1, sm: 4 }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center" }}
                >
                  <CalendarMonthOutlined color="primary" fontSize="small" />
                  <Typography>ทำทุก {schedule.intervalMonths} เดือน</Typography>
                </Stack>
                <Typography color="text.secondary">
                  ทำล่าสุด {formatPMDate(schedule.lastDoneAt)}
                </Typography>
                <Typography color="text.secondary">
                  ครบกำหนด {formatPMDate(schedule.nextDueAt)}
                </Typography>
              </Stack>
              <Typography color="text.secondary" sx={{ mt: 1.5 }}>
                ผู้รับผิดชอบ:{" "}
                {schedule.assignedTechnicianName ?? "ยังไม่มอบหมาย"}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1.5 }}>
                แผนงาน: {schedule.planDetails || "ยังไม่ได้ระบุรายละเอียดแผน"}
              </Typography>
            </MainCard>
          );
        })}
      </Stack>
    </Stack>
  );
}
