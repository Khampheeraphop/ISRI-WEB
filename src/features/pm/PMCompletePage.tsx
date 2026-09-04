import { ArrowBackOutlined, HistoryOutlined } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { MainCard } from "../../components/base/MainCard";
import { GenericForm } from "../../components/form/GenericForm";
import type { FormField } from "../../components/form/types";
import { useAuth } from "../../hooks/useAuth";
import { formatPMDate, pmDateInput } from "./pm.constants";
import { completePMSchedule, getPMSchedule } from "./pmApi";

type PMCompletionForm = { completedAt: string; notes: string };
const fields: FormField<PMCompletionForm>[] = [
  {
    name: "completedAt",
    label: "วันที่ดำเนินการ",
    type: "date",
    required: true,
  },
  {
    name: "notes",
    label: "ผลการตรวจและการดำเนินการ",
    type: "textarea",
    required: true,
    fullWidth: true,
  },
];
const schema: yup.ObjectSchema<PMCompletionForm> = yup.object({
  completedAt: yup.string().required("กรุณาระบุวันที่ดำเนินการ"),
  notes: yup.string().trim().max(4000).required(),
});

export function PMCompletePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const detail = useQuery({
    queryKey: ["pm-schedule", id],
    queryFn: () => getPMSchedule(id ?? ""),
    enabled: Boolean(id),
  });
  const complete = useMutation({
    mutationFn: (values: PMCompletionForm) =>
      completePMSchedule({
        id: id ?? "",
        completedAt: new Date(
          `${values.completedAt}T00:00:00+07:00`,
        ).toISOString(),
        notes: values.notes,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["pm-schedules"] }),
        queryClient.invalidateQueries({ queryKey: ["pm-schedule", id] }),
      ]);
      navigate("/pm");
    },
  });
  if (detail.isLoading)
    return (
      <Box sx={{ minHeight: 320, display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  if (detail.isError || !detail.data)
    return <Alert severity="warning">ไม่พบตาราง PM</Alert>;
  const { schedule, logs } = detail.data;
  const canComplete = profile?.role === "technician";

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
        <Typography variant="h3">
          {canComplete ? "บันทึกผล PM" : "ประวัติ PM"}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          {schedule.assetName} · {schedule.locationLabel}
        </Typography>
      </Box>
      {canComplete && (
        <>
          {complete.isError && (
            <Alert severity="error">
              {complete.error instanceof Error
                ? complete.error.message
                : "ไม่สามารถบันทึกผล PM ได้"}
            </Alert>
          )}
          <MainCard
            title={<Typography variant="h5">ผลการตรวจรอบนี้</Typography>}
            subheader={`ครบกำหนด ${formatPMDate(schedule.nextDueAt)}`}
          >
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              แผนงาน: {schedule.planDetails || "ยังไม่ได้ระบุรายละเอียดแผน"}
            </Typography>
            <GenericForm<PMCompletionForm>
              fields={fields}
              schema={schema}
              defaultValues={{
                completedAt: pmDateInput(),
                notes: "",
              }}
              submitLabel="บันทึกผลและเลื่อนรอบถัดไป"
              onCancel={() => navigate("/pm")}
              onSubmit={(values) => complete.mutate(values)}
              isSubmitting={complete.isPending}
            />
          </MainCard>
        </>
      )}
      {!canComplete && (
        <MainCard
          title={<Typography variant="h5">รายละเอียดแผน PM</Typography>}
          subheader={`ครบกำหนด ${formatPMDate(schedule.nextDueAt)}`}
        >
          <Typography color="text.secondary">
            {schedule.planDetails || "ยังไม่ได้ระบุรายละเอียดแผน"}
          </Typography>
        </MainCard>
      )}
      <MainCard
        title={
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <HistoryOutlined color="primary" />
            <Typography variant="h5">ประวัติการทำ PM</Typography>
          </Stack>
        }
      >
        <Stack spacing={1.5}>
          {logs.map((log) => (
            <Box
              key={log.id}
              sx={{ borderLeft: 3, borderColor: "primary.light", pl: 2 }}
            >
              <Typography sx={{ fontWeight: 700 }}>
                {formatPMDate(log.completedAt)}
              </Typography>
              <Typography color="text.secondary">
                ผู้ดำเนินการ: {log.technicianName ?? "ไม่ระบุ"}
              </Typography>
              <Typography color="text.secondary">{log.notes}</Typography>
            </Box>
          ))}
          {!logs.length && (
            <Typography color="text.secondary">
              ยังไม่มีประวัติการทำ PM
            </Typography>
          )}
        </Stack>
      </MainCard>
    </Stack>
  );
}
