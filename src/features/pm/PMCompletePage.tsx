import { ArrowBackOutlined, HistoryOutlined } from "@mui/icons-material";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { MainCard } from "../../components/base/MainCard";
import { GenericForm } from "../../components/form/GenericForm";
import type { FormField } from "../../components/form/types";
import { useAuth } from "../../hooks/useAuth";
import {
  useCompletePMScheduleMutation,
  useEntityQuery,
} from "../../hooks/useEntity";
import { formatPMDate } from "./pm.constants";

type PMCompletionForm = { notes: string };
const fields: FormField<PMCompletionForm>[] = [
  {
    name: "notes",
    label: "ผลการตรวจและการดำเนินการ",
    type: "textarea",
    required: true,
    fullWidth: true,
  },
];
const schema = yup.object({
  notes: yup
    .string()
    .trim()
    .min(10, "กรุณาระบุรายละเอียดอย่างน้อย 10 ตัวอักษร")
    .required(),
}) as yup.ObjectSchema<PMCompletionForm>;

export function PMCompletePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const schedules = useEntityQuery("pmSchedules");
  const logs = useEntityQuery("pmLogs");
  const complete = useCompletePMScheduleMutation();
  const schedule = (schedules.data ?? []).find((item) => item.id === id);
  if (!schedules.isLoading && !schedule)
    return <Alert severity="warning">ไม่พบตาราง PM</Alert>;
  if (!schedule) return null;
  const history = (logs.data ?? [])
    .filter((log) => log.scheduleId === schedule.id)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  const submit = async (values: PMCompletionForm) => {
    await complete.mutateAsync({
      scheduleId: schedule.id,
      technicianId: user.id,
      notes: values.notes,
    });
    navigate("/pm");
  };
  return (
    <Stack spacing={3}>
      <Box>
        <Button
          startIcon={<ArrowBackOutlined />}
          onClick={() => navigate("/pm")}
          sx={{ mb: 1 }}
        >
          กลับไปแผน PM
        </Button>
        <Typography variant="h3">บันทึกผล PM</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          {schedule.assetName} · {schedule.locationLabel}
        </Typography>
      </Box>
      <MainCard
        title={<Typography variant="h5">ผลการตรวจรอบนี้</Typography>}
        subheader={`ครบกำหนด ${formatPMDate(schedule.nextDueAt)}`}
      >
        <GenericForm<PMCompletionForm>
          fields={fields}
          schema={schema}
          defaultValues={{ notes: "" }}
          submitLabel="บันทึกผลและเลื่อนรอบถัดไป"
          onCancel={() => navigate("/pm")}
          onSubmit={submit}
          isSubmitting={complete.isPending}
        />
      </MainCard>
      <MainCard
        title={
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <HistoryOutlined color="primary" />
            <Typography variant="h5">ประวัติการทำ PM</Typography>
          </Stack>
        }
      >
        <Stack spacing={1.5}>
          {history.map((log) => (
            <Box
              key={log.id}
              sx={{ borderLeft: 3, borderColor: "primary.light", pl: 2 }}
            >
              <Typography sx={{ fontWeight: 700 }}>
                {formatPMDate(log.completedAt)}
              </Typography>
              <Typography color="text.secondary">{log.notes}</Typography>
            </Box>
          ))}
          {!history.length && (
            <Typography color="text.secondary">
              ยังไม่มีประวัติการทำ PM
            </Typography>
          )}
        </Stack>
      </MainCard>
    </Stack>
  );
}
