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
  assignedTechnicianId: string;
};

const schema: yup.ObjectSchema<PMForm> = yup.object({
  locationId: yup.string().required(),
  assetName: yup
    .string()
    .trim()
    .min(2)
    .max(200)
    .required("กรุณาระบุชื่อครุภัณฑ์"),
  planDetails: yup.string().trim().min(10, "กรุณาระบุอย่างน้อย 10 ตัวอักษร").max(2000).required("กรุณาระบุรายละเอียดแผน"),
  intervalMonths: yup.number().integer().min(1).max(60).required(),
  lastDoneAt: yup.string().defined(),
  nextDueAt: yup.string().required("กรุณาระบุวันครบกำหนดครั้งถัดไป"),
  assignedTechnicianId: yup.string().defined(),
});

const toInput = (values: PMForm): PMScheduleInput => ({
  ...values,
  intervalMonths: Number(values.intervalMonths),
  lastDoneAt: values.lastDoneAt
    ? new Date(`${values.lastDoneAt}T00:00:00+07:00`).toISOString()
    : null,
  nextDueAt: new Date(`${values.nextDueAt}T00:00:00+07:00`).toISOString(),
  assignedTechnicianId: values.assignedTechnicianId || null,
});

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
          { value: "", label: "ยังไม่มอบหมาย" },
          ...(technicians.data ?? []).map((item) => ({
            value: item.id,
            label: item.full_name,
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
        name: "planDetails",
        label: "รายละเอียดแผน PM",
        type: "textarea",
        required: true,
        fullWidth: true,
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
            assignedTechnicianId: editing.assignedTechnicianId ?? "",
          }
        : {
            locationId: locations.data?.[0]?.id ?? "",
            assetName: locations.data?.[0]?.assetName ?? "",
            planDetails:
              "ตรวจสอบสภาพการใช้งาน ทำความสะอาด และบันทึกผลการตรวจตามรอบ",
            intervalMonths: 3,
            lastDoneAt: "",
            nextDueAt: pmDateInput(),
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
