import { AddOutlined, BuildOutlined, CalendarMonthOutlined } from "@mui/icons-material";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { MainCard } from "../../components/base/MainCard";
import { useEntityQuery } from "../../hooks/useEntity";
import { formatPMDate, getPMDueDetail } from "./pm.constants";

export function PMSchedulesPage() {
  const schedules = useEntityQuery("pmSchedules");
  return <Stack spacing={3}>
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: { xs: "flex-start", sm: "center" }, flexDirection: { xs: "column", sm: "row" } }}>
      <Box><Typography variant="h3">แผนบำรุงรักษาเชิงป้องกัน</Typography><Typography color="text.secondary" sx={{ mt: 0.5 }}>ติดตามรอบตรวจเช็คครุภัณฑ์และบันทึกผลการทำ PM</Typography></Box>
      <Button component={Link} to="/pm/new" variant="contained" startIcon={<AddOutlined />}>ตั้งรอบ PM</Button>
    </Box>
    <Stack spacing={2}>
      {(schedules.data ?? []).sort((a, b) => a.nextDueAt.localeCompare(b.nextDueAt)).map((schedule) => {
        const due = getPMDueDetail(schedule);
        return <MainCard key={schedule.id} title={<Typography variant="h5">{schedule.assetName}</Typography>} subheader={schedule.locationLabel} action={<Chip size="small" color={due.color} variant="outlined" label={due.label} />} footer={<Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ width: "100%", justifyContent: "flex-end" }}><Button component={Link} to={`/pm/${schedule.id}/complete`} variant="contained" startIcon={<BuildOutlined />}>บันทึกผล PM</Button><Button component={Link} to={`/pm/${schedule.id}/edit`} variant="outlined">แก้ไขรอบ</Button></Stack>}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 1, sm: 4 }}><Stack direction="row" spacing={1} sx={{ alignItems: "center" }}><CalendarMonthOutlined color="primary" fontSize="small" /><Typography>ทำทุก {schedule.intervalMonths} เดือน</Typography></Stack><Typography color="text.secondary">ทำล่าสุด {formatPMDate(schedule.lastDoneAt)}</Typography><Typography color="text.secondary">ครบกำหนด {formatPMDate(schedule.nextDueAt)}</Typography></Stack>
        </MainCard>;
      })}
    </Stack>
  </Stack>;
}
