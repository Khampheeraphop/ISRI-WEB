import { ArrowBackOutlined } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { MainCard } from "../../components/base/MainCard";
import { GenericForm } from "../../components/form/GenericForm";
import type { FormField } from "../../components/form/types";
import { getManagedLocations } from "../admin/locationsApi";
import { useAuth } from "../../hooks/useAuth";
import { pmDateInput } from "./pm.constants";
import {
  createPMSchedule,
  getPMSchedules,
  getPMTechnicians,
  updatePMSchedule,
  type PMScheduleInput,
} from "./pmApi";

type PMForm = {
  locationId: string;
  assetName: string;
  planDetails: string;
  intervalMonths: number;
  lastDoneAt: string;
  nextDueAt: string;
  endAt: string;
  status: "draft" | "active" | "paused" | "completed" | "cancelled";
  assignedTechnicianId: string;
};

const schema: yup.ObjectSchema<PMForm> = yup.object({
  locationId: yup.string().required("กรุณากรอกข้อมูลให้ครบถ้วน"),
  assetName: yup
    .string()
    .trim()
    .min(2)
    .max(200)
    .required("กรุณาระบุชื่อครุภัณฑ์"),
  planDetails: yup.string().trim().max(2000).required("กรุณาระบุรายละเอียดแผน"),
  intervalMonths: yup.number().integer().min(1).max(60).required("กรุณากรอกข้อมูลให้ครบถ้วน"),
  lastDoneAt: yup.string().defined(),
  nextDueAt: yup.string().required("กรุณาระบุวันครบกำหนดครั้งถัดไป"),
  endAt: yup.string().defined()
    .test(
      "required-while-active",
      "แผนที่ใช้งานต้องระบุวันสิ้นสุด",
      (value, context) => context.parent.status !== "active" || Boolean(value),
    )
    .test(
      "after-next-due",
      "วันสิ้นสุดต้องไม่น้อยกว่าวันครบกำหนดครั้งถัดไป",
      (value, context) => !value || !context.parent.nextDueAt || value >= context.parent.nextDueAt,
    ),
  status: yup
    .mixed<PMForm["status"]>()
    .oneOf(["draft", "active", "paused", "completed", "cancelled"])
    .required("กรุณาเลือกสถานะแผน"),
  assignedTechnicianId: yup.string().defined(),
});

const toInput = (values: PMForm): PMScheduleInput => ({
  ...values,
  intervalMonths: Number(values.intervalMonths),
  lastDoneAt: values.lastDoneAt
    ? new Date(`${values.lastDoneAt}T00:00:00+07:00`).toISOString()
    : null,
  nextDueAt: new Date(`${values.nextDueAt}T00:00:00+07:00`).toISOString(),
  endAt: values.endAt
    ? new Date(`${values.endAt}T23:59:59+07:00`).toISOString()
    : null,
  status: values.status,
  assignedTechnicianId: values.assignedTechnicianId || null,
});

const specialtyLabels: Record<string, string> = {
  electrical: "งานไฟฟ้า",
  plumbing: "งานประปา",
  air_conditioning: "เครื่องปรับอากาศ",
  elevator: "งานลิฟต์",
  building: "โครงสร้างอาคาร",
};

export function formatTechnicianSpecialties(specialties?: string[]): string {
  if (!specialties || specialties.length === 0) return "";
  return specialties.map((s) => specialtyLabels[s] ?? s).join(", ");
}

export function PMScheduleFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  const technicians = useQuery({
    queryKey: ["pm-technicians"],
    queryFn: getPMTechnicians,
    enabled: isAdmin,
  });
  const schedules = useQuery({
    queryKey: ["pm-schedules"],
    queryFn: getPMSchedules,
  });
  const locations = useQuery({
    queryKey: ["managed-locations"],
    queryFn: getManagedLocations,
  });
  const editing = id
    ? schedules.data?.find((item) => item.id === id)
    : undefined;
  const save = useMutation({
    mutationFn: async (values: PMForm) =>
      editing
        ? updatePMSchedule({ id: editing.id, ...toInput(values) })
        : createPMSchedule(toInput(values)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["pm-schedules"] });
      navigate("/pm");
    },
  });
  const fields = useMemo<FormField<PMForm>[]>(
    () => [
      {
        name: "locationId",
        label: "จุด/ตำแหน่ง",
        type: "select",
        required: true,
        readOnly: !isAdmin,
        options: (locations.data ?? []).map((location) => ({
          value: location.id,
          label: `${location.building} · ${location.floor} · ${location.zone}`,
        })),
      },
      {
        name: "assetName",
        label: "ชื่อครุภัณฑ์",
        required: true,
        readOnly: !isAdmin,
      },
      {
        name: "assignedTechnicianId",
        label: "ช่างผู้รับผิดชอบ",
        type: "select",
        readOnly: !isAdmin,
        options: [
          { value: "", label: "-- ยังไม่ระบุช่าง (เลือกภายหลังได้) --" },
          ...(technicians.data ?? []).map((t) => ({
            value: t.id,
            label: `${t.full_name} (${t.email})${
              t.technician_specialties?.length
                ? ` · ${formatTechnicianSpecialties(t.technician_specialties)}`
                : ""
            }`,
          })),
          ...(!isAdmin && editing?.assignedTechnicianId
            ? [
                {
                  value: editing.assignedTechnicianId,
                  label: editing.assignedTechnicianName ?? "ช่างผู้รับผิดชอบ",
                },
              ]
            : []),
        ],
      },
      {
        name: "status",
        label: "สถานะแผน PM",
        type: "select",
        required: true,
        readOnly: !isAdmin,
        options: [
          { value: "draft", label: "ฉบับร่าง" },
          { value: "active", label: "ใช้งาน" },
          { value: "paused", label: "พักแผน" },
          { value: "completed", label: "สิ้นสุดแล้ว" },
          { value: "cancelled", label: "ยกเลิก" },
        ],
      },
      {
        name: "intervalMonths",
        label: "รอบตรวจ (เดือน)",
        type: "number",
        required: true,
      },
      {
        name: "lastDoneAt",
        label: "วันที่ทำ PM ล่าสุด",
        type: "date",
        readOnly: Boolean(editing),
      },
      {
        name: "nextDueAt",
        label: "วันครบกำหนดครั้งถัดไป",
        type: "date",
        required: true,
      },
      {
        name: "endAt",
        label: "วันสิ้นสุดแผน (เว้นว่างได้)",
        type: "date",
        readOnly: !isAdmin,
      },
      {
        name: "planDetails",
        label: "รายละเอียดแผน PM",
        type: "textarea",
        required: true,
        fullWidth: true,
      },
    ],
    [locations.data, technicians.data, isAdmin, editing],
  );
  const defaults = useMemo<PMForm>(
    () =>
      editing
        ? {
            locationId: editing.locationId,
            assetName: editing.assetName,
            planDetails: editing.planDetails,
            intervalMonths: editing.intervalMonths,
            lastDoneAt: editing.lastDoneAt
              ? pmDateInput(editing.lastDoneAt)
              : "",
            nextDueAt: pmDateInput(editing.nextDueAt),
            endAt: editing.endAt ? pmDateInput(editing.endAt) : "",
            status: editing.status,
            assignedTechnicianId: editing.assignedTechnicianId ?? "",
          }
        : {
            locationId: locations.data?.[0]?.id ?? "",
            assetName: locations.data?.[0]?.assetName ?? "",
            planDetails:
              "ตรวจสอบสภาพการใช้งาน ทำความสะอาด และบันทึกผลการตรวจตามรอบ",
            intervalMonths: 1,
            lastDoneAt: "",
            nextDueAt: pmDateInput(),
            endAt: "",
            status: "active",
            assignedTechnicianId: "",
          },
    [editing, locations.data],
  );

  if (
    schedules.isLoading ||
    locations.isLoading ||
    (isAdmin && technicians.isLoading)
  )
    return (
      <Box sx={{ minHeight: 320, display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  if (id && !editing)
    return <Alert severity="warning">ไม่พบตาราง PM ที่ต้องการแก้ไข</Alert>;

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
          {editing ? "แก้ไขรอบ PM" : "ตั้งรอบ PM"}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          กำหนดรอบตรวจและวันครบกำหนด เมื่อบันทึกผล PM
          ระบบจะเลื่อนรอบจากวันที่ดำเนินการล่าสุด
        </Typography>
      </Box>
      {(locations.isError ||
        schedules.isError ||
        technicians.isError ||
        save.isError) && (
        <Alert severity="error">
          {save.error instanceof Error
            ? save.error.message
            : "ไม่สามารถโหลดหรือบันทึกข้อมูลรอบ PM ได้"}
        </Alert>
      )}
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
