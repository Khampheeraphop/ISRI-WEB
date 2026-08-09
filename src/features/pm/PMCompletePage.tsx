import { ArrowBackOutlined, HistoryOutlined } from "@mui/icons-material";
import { Alert, Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { MainCard } from "../../components/base/MainCard";
import { GenericForm } from "../../components/form/GenericForm";
import type { FormField } from "../../components/form/types";
import { formatPMDate } from "./pm.constants";
import { completePMSchedule, getPMSchedule } from "./pmApi";

type PMCompletionForm = { notes: string };
const fields: FormField<PMCompletionForm>[] = [{ name: "notes", label: "ผลการตรวจและการดำเนินการ", type: "textarea", required: true, fullWidth: true }];
const schema: yup.ObjectSchema<PMCompletionForm> = yup.object({ notes: yup.string().trim().min(10, "กรุณาระบุรายละเอียดอย่างน้อย 10 ตัวอักษร").max(4000).required() });

export function PMCompletePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const detail = useQuery({ queryKey: ["pm-schedule", id], queryFn: () => getPMSchedule(id ?? ""), enabled: Boolean(id) });
  const complete = useMutation({
    mutationFn: (values: PMCompletionForm) => completePMSchedule({ id: id ?? "", notes: values.notes }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["pm-schedules"] }),
        queryClient.invalidateQueries({ queryKey: ["pm-schedule", id] }),
      ]);
      navigate("/pm");
    },
  });
  if (detail.isLoading) return <Box sx={{ minHeight: 320, display: "grid", placeItems: "center" }}><CircularProgress /></Box>;
  if (detail.isError || !detail.data) return <Alert severity="warning">ไม่พบตาราง PM</Alert>;
  const { schedule, logs } = detail.data;

  return (
    <Stack spacing={3}>
      <Box>
        <Button startIcon={<ArrowBackOutlined />} onClick={() => navigate("/pm")} sx={{ mb: 1 }}>กลับไปแผน PM</Button>
        <Typography variant="h3">บันทึกผล PM</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>{schedule.assetName} · {schedule.locationLabel}</Typography>
      </Box>
      {complete.isError && <Alert severity="error">ไม่สามารถบันทึกผล PM ได้</Alert>}
      <MainCard title={<Typography variant="h5">ผลการตรวจรอบนี้</Typography>} subheader={`ครบกำหนด ${formatPMDate(schedule.nextDueAt)}`}>
        <GenericForm<PMCompletionForm>
          fields={fields}
          schema={schema}
          defaultValues={{ notes: "" }}
          submitLabel="บันทึกผลและเลื่อนรอบถัดไป"
          onCancel={() => navigate("/pm")}
          onSubmit={(values) => complete.mutate(values)}
          isSubmitting={complete.isPending}
        />
      </MainCard>
      <MainCard title={<Stack direction="row" spacing={1} sx={{ alignItems: "center" }}><HistoryOutlined color="primary" /><Typography variant="h5">ประวัติการทำ PM</Typography></Stack>}>
        <Stack spacing={1.5}>
          {logs.map((log) => <Box key={log.id} sx={{ borderLeft: 3, borderColor: "primary.light", pl: 2 }}><Typography sx={{ fontWeight: 700 }}>{formatPMDate(log.completedAt)}</Typography><Typography color="text.secondary">{log.notes}</Typography></Box>)}
          {!logs.length && <Typography color="text.secondary">ยังไม่มีประวัติการทำ PM</Typography>}
        </Stack>
      </MainCard>
    </Stack>
  );
}
