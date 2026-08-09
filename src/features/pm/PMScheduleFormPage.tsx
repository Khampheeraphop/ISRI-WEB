import { ArrowBackOutlined } from "@mui/icons-material";
import { Alert, Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { MainCard } from "../../components/base/MainCard";
import { GenericForm } from "../../components/form/GenericForm";
import type { FormField } from "../../components/form/types";
import { getManagedLocations } from "../admin/locationsApi";
import { createPMSchedule, getPMSchedules, updatePMSchedule, type PMScheduleInput } from "./pmApi";

type PMForm = { locationId: string; assetName: string; intervalMonths: number; lastDoneAt: string };

const schema: yup.ObjectSchema<PMForm> = yup.object({
  locationId: yup.string().required(),
  assetName: yup.string().trim().required("กรุณาระบุชื่อครุภัณฑ์"),
  intervalMonths: yup.number().integer().min(1).max(60).required(),
  lastDoneAt: yup.string().required(),
});

const toInput = (values: PMForm): PMScheduleInput => ({
  ...values,
  intervalMonths: Number(values.intervalMonths),
  lastDoneAt: new Date(`${values.lastDoneAt}T09:00:00+07:00`).toISOString(),
});

export function PMScheduleFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const schedules = useQuery({ queryKey: ["pm-schedules"], queryFn: getPMSchedules });
  const locations = useQuery({ queryKey: ["managed-locations"], queryFn: getManagedLocations });
  const editing = id ? schedules.data?.find((item) => item.id === id) : undefined;
  const save = useMutation({
    mutationFn: async (values: PMForm) => editing
      ? updatePMSchedule({ id: editing.id, ...toInput(values) })
      : createPMSchedule(toInput(values)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["pm-schedules"] });
      navigate("/pm");
    },
  });
  const fields = useMemo<FormField<PMForm>[]>(() => [
    {
      name: "locationId",
      label: "จุด/ตำแหน่ง",
      type: "select",
      required: true,
      options: (locations.data ?? []).map((location) => ({ value: location.id, label: `${location.building} · ${location.floor} · ${location.zone}` })),
    },
    { name: "assetName", label: "ชื่อครุภัณฑ์", required: true },
    { name: "intervalMonths", label: "รอบตรวจ (เดือน)", type: "number", required: true },
    { name: "lastDoneAt", label: "วันที่ทำ PM ล่าสุด", type: "date", required: true },
  ], [locations.data]);
  const defaults = useMemo<PMForm>(() => editing ? {
    locationId: editing.locationId,
    assetName: editing.assetName,
    intervalMonths: editing.intervalMonths,
    lastDoneAt: editing.lastDoneAt.slice(0, 10),
  } : {
    locationId: locations.data?.[0]?.id ?? "",
    assetName: locations.data?.[0]?.assetName ?? "",
    intervalMonths: 3,
    lastDoneAt: new Date().toISOString().slice(0, 10),
  }, [editing, locations.data]);

  if (schedules.isLoading || locations.isLoading)
    return <Box sx={{ minHeight: 320, display: "grid", placeItems: "center" }}><CircularProgress /></Box>;
  if (id && !editing) return <Alert severity="warning">ไม่พบตาราง PM ที่ต้องการแก้ไข</Alert>;

  return (
    <Stack spacing={3}>
      <Box>
        <Button startIcon={<ArrowBackOutlined />} onClick={() => navigate("/pm")} sx={{ mb: 1 }}>กลับไปแผน PM</Button>
        <Typography variant="h3">{editing ? "แก้ไขรอบ PM" : "ตั้งรอบ PM"}</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>ระบบจะคำนวณวันครบกำหนดรอบถัดไปจากวันที่ทำล่าสุดและรอบตรวจที่กำหนด</Typography>
      </Box>
      {(locations.isError || schedules.isError || save.isError) && <Alert severity="error">ไม่สามารถบันทึกข้อมูลรอบ PM ได้</Alert>}
      <MainCard title={<Typography variant="h5">ข้อมูลรอบตรวจ</Typography>}>
        <GenericForm<PMForm>
          key={editing?.id ?? "new-pm"}
          fields={fields}
          schema={schema}
          defaultValues={defaults}
          columns={2}
          submitLabel={editing ? "บันทึกการแก้ไข" : "ตั้งรอบ PM"}
          onCancel={() => navigate("/pm")}
          onSubmit={(values) => save.mutate(values)}
          isSubmitting={save.isPending}
        />
      </MainCard>
    </Stack>
  );
}
