import { ArrowBackOutlined } from "@mui/icons-material";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { MainCard } from "../../components/base/MainCard";
import { GenericForm } from "../../components/form/GenericForm";
import type { FormField } from "../../components/form/types";
import { useEntityMutation, useEntityQuery, useEntityUpdateMutation } from "../../hooks/useEntity";
import { pmLocations } from "./pm.constants";

type PMForm = { locationId: string; assetName: string; intervalMonths: number; lastDoneAt: string };
const fields: FormField<PMForm>[] = [
  { name: "locationId", label: "จุด/ตำแหน่ง", type: "select", required: true, options: pmLocations.map((location) => ({ label: location.label, value: location.id })) },
  { name: "assetName", label: "ชื่อครุภัณฑ์", required: true },
  { name: "intervalMonths", label: "รอบตรวจ (เดือน)", type: "number", required: true },
  { name: "lastDoneAt", label: "วันที่ทำ PM ล่าสุด", type: "date", required: true },
];
const schema = yup.object({ locationId: yup.string().required(), assetName: yup.string().trim().required("กรุณาระบุชื่อครุภัณฑ์"), intervalMonths: yup.number().integer().min(1).required(), lastDoneAt: yup.string().required() }) as yup.ObjectSchema<PMForm>;

export function PMScheduleFormPage() {
  const { id } = useParams(); const navigate = useNavigate(); const schedules = useEntityQuery("pmSchedules"); const createSchedule = useEntityMutation("pmSchedules"); const updateSchedule = useEntityUpdateMutation("pmSchedules"); const [feedback, setFeedback] = useState<string>();
  const editing = id && id !== "new" ? (schedules.data ?? []).find((item) => item.id === id) : undefined;
  const defaults = useMemo<PMForm>(() => editing ? { locationId: editing.locationId, assetName: editing.assetName, intervalMonths: editing.intervalMonths, lastDoneAt: editing.lastDoneAt.slice(0, 10) } : { locationId: pmLocations[0].id, assetName: "", intervalMonths: 3, lastDoneAt: new Date().toISOString().slice(0, 10) }, [editing]);
  if (!schedules.isLoading && id && id !== "new" && !editing) return <Alert severity="warning">ไม่พบตาราง PM ที่ต้องการแก้ไข</Alert>;
  const save = async (values: PMForm) => { try { const locationLabel = pmLocations.find((item) => item.id === values.locationId)?.label ?? values.locationId; const lastDoneAt = new Date(`${values.lastDoneAt}T09:00:00+07:00`).toISOString(); if (editing) { const nextDueAt = new Date(lastDoneAt); nextDueAt.setMonth(nextDueAt.getMonth() + Number(values.intervalMonths)); await updateSchedule.mutateAsync({ id: editing.id, changes: { ...values, intervalMonths: Number(values.intervalMonths), locationLabel, lastDoneAt, nextDueAt: nextDueAt.toISOString() } }); } else await createSchedule.mutateAsync({ ...values, intervalMonths: Number(values.intervalMonths), locationLabel, lastDoneAt }); navigate("/pm"); } catch { setFeedback("ไม่สามารถบันทึกรอบ PM ได้"); } };
  return <Stack spacing={3}><Box><Button startIcon={<ArrowBackOutlined />} onClick={() => navigate("/pm")} sx={{ mb: 1 }}>กลับไปแผน PM</Button><Typography variant="h3">{editing ? "แก้ไขรอบ PM" : "ตั้งรอบ PM"}</Typography><Typography color="text.secondary" sx={{ mt: 0.5 }}>ระบบจะคำนวณวันครบกำหนดรอบถัดไปให้อัตโนมัติ</Typography></Box>{feedback && <Alert severity="error">{feedback}</Alert>}<MainCard title={<Typography variant="h5">ข้อมูลรอบตรวจ</Typography>}><GenericForm<PMForm> key={editing?.id ?? "new-pm"} fields={fields} schema={schema} defaultValues={defaults} columns={2} submitLabel={editing ? "บันทึกการแก้ไข" : "ตั้งรอบ PM"} onCancel={() => navigate("/pm")} onSubmit={save} isSubmitting={createSchedule.isPending || updateSchedule.isPending} /></MainCard></Stack>;
}
