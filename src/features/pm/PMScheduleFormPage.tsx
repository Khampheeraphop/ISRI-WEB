import {
  ArrowBackOutlined,
  CalendarMonthOutlined,
  CheckCircleOutlined,
  EngineeringOutlined,
  EventRepeatOutlined,
  Inventory2Outlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
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
  lastDoneAt: yup
    .string()
    .defined()
    .test(
      "not-in-future",
      "วันที่ทำ PM ล่าสุดต้องไม่เกินวันนี้",
      (value) => !value || value <= pmDateInput(),
    ),
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

function addMonthsToDateInput(value: string, months: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match || !Number.isInteger(months) || months < 0) return "";

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const absoluteMonth = monthIndex + months;
  const targetYear = year + Math.floor(absoluteMonth / 12);
  const targetMonth = ((absoluteMonth % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  const targetDay = Math.min(day, lastDay);

  return `${targetYear}-${String(targetMonth + 1).padStart(2, "0")}-${String(
    targetDay,
  ).padStart(2, "0")}`;
}

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
        description: "เลือกตำแหน่งติดตั้งของครุภัณฑ์ที่ต้องการวางแผน",
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
        description: "ระบุชื่อให้ค้นหาและแยกจากครุภัณฑ์อื่นได้ง่าย",
        required: true,
        readOnly: !isAdmin,
      },
      {
        name: "assignedTechnicianId",
        label: "ช่างผู้รับผิดชอบ",
        description: "เว้นว่างได้ หากต้องการมอบหมายผู้รับผิดชอบภายหลัง",
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
        readOnly: !isAdmin || editing?.status === "completed",
        options: [
          ...(editing?.status === "draft"
            ? [
                {
                  value: "draft",
                  label: "ฉบับร่าง (สถานะเดิม)",
                  disabled: true,
                },
              ]
            : []),
          { value: "active", label: "กำลังใช้งาน" },
          { value: "paused", label: "พักชั่วคราว" },
          { value: "cancelled", label: "ยกเลิกแผน" },
          ...(editing?.status === "completed"
            ? [
                {
                  value: "completed",
                  label: "สิ้นสุดแล้ว (ระบบกำหนด)",
                  disabled: true,
                },
              ]
            : []),
        ],
      },
      {
        name: "intervalMonths",
        label: "รอบตรวจ (เดือน)",
        type: "number",
        required: true,
        min: 1,
        max: 60,
        description: "ระบบจะเลื่อนกำหนดรอบถัดไปตามจำนวนเดือนนี้",
      },
      {
        name: "lastDoneAt",
        label: "วันที่ทำ PM ล่าสุด",
        type: "date",
        readOnly: Boolean(editing),
        description: editing
          ? "วันที่นี้อ้างอิงจากผล PM ล่าสุดและแก้ไขไม่ได้"
          : "เว้นว่างได้ หากครุภัณฑ์นี้ยังไม่เคยทำ PM",
      },
      {
        name: "nextDueAt",
        label: "วันครบกำหนดครั้งถัดไป",
        type: "date",
        required: true,
        readOnly: true,
        description: "ระบบคำนวณจากวันที่ PM ล่าสุด (หรือวันนี้) และรอบตรวจ",
      },
      {
        name: "endAt",
        label: "วันสิ้นสุดแผน",
        type: "date",
        readOnly: !isAdmin,
        description: "ผู้ใช้กำหนดเอง โดยต้องไม่ก่อนวันครบกำหนด และจำเป็นเมื่อแผนกำลังใช้งาน",
      },
      {
        name: "planDetails",
        label: "รายละเอียดแผน PM",
        type: "textarea",
        required: true,
        fullWidth: true,
        description: "ระบุรายการตรวจ วิธีดำเนินงาน หรือข้อควรระวังให้ช่างเข้าใจตรงกัน",
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
            nextDueAt: addMonthsToDateInput(pmDateInput(), 1),
            endAt: "",
            status: "active",
            assignedTechnicianId: "",
          },
    [editing, locations.data],
  );
  const deriveScheduleDates = useCallback(
    (values: PMForm): Partial<PMForm> => {
      const interval = Number(values.intervalMonths);
      if (!Number.isInteger(interval) || interval < 1 || interval > 60) {
        return {};
      }

      const nextDueAt = editing
        ? values.lastDoneAt
          ? addMonthsToDateInput(values.lastDoneAt, interval)
          : pmDateInput(editing.nextDueAt)
        : addMonthsToDateInput(values.lastDoneAt || pmDateInput(), interval);

      if (!nextDueAt) return {};
      return { nextDueAt };
    },
    [editing],
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
    <Stack spacing={2.5} sx={{ maxWidth: 1440, mx: "auto" }}>
      <MainCard
        contentSx={{ p: "0 !important" }}
        sx={{
          overflow: "hidden",
          borderColor: "rgba(81, 61, 145, 0.16)",
          background:
            "linear-gradient(120deg, rgba(81, 61, 145, 0.10) 0%, rgba(255,255,255,0.98) 58%, rgba(233, 225, 249, 0.72) 100%)",
        }}
      >
        <Box
          sx={{
            px: { xs: 2.5, md: 3.5 },
            py: { xs: 2.5, md: 3 },
            display: "flex",
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            gap: 2,
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                display: "grid",
                placeItems: "center",
                bgcolor: "primary.main",
                color: "primary.contrastText",
                boxShadow: "0 10px 24px rgba(81, 61, 145, 0.22)",
                flexShrink: 0,
              }}
            >
              <CalendarMonthOutlined />
            </Box>
            <Box>
              <Typography variant="h3">
                {editing ? "แก้ไขรอบ PM" : "ตั้งรอบ PM"}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                กำหนดครุภัณฑ์ ผู้รับผิดชอบ และช่วงเวลาของแผนบำรุงรักษา
              </Typography>
            </Box>
          </Stack>
          <Button
            startIcon={<ArrowBackOutlined />}
            onClick={() => navigate("/pm")}
            variant="outlined"
            sx={{ bgcolor: "background.paper", flexShrink: 0 }}
          >
            กลับไปแผน PM
          </Button>
        </Box>
      </MainCard>
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
      <MainCard
        title={
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                bgcolor: "primary.50",
                color: "primary.main",
              }}
            >
              <Inventory2Outlined fontSize="small" />
            </Box>
            <Box>
              <Typography variant="h5">ข้อมูลรอบตรวจ</Typography>
              <Typography variant="body2" color="text.secondary">
                กรอกข้อมูลตามลำดับ แล้วตรวจสอบวันเริ่มต้นและวันสิ้นสุดก่อนบันทึก
              </Typography>
            </Box>
          </Stack>
        }
        contentSx={{ p: { xs: 2.5, md: 3 } }}
      >
        <Stack spacing={3}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              border: 1,
              borderColor: "divider",
              borderRadius: 2.5,
              overflow: "hidden",
              bgcolor: "rgba(81, 61, 145, 0.025)",
            }}
          >
            {[
              {
                icon: <Inventory2Outlined fontSize="small" />,
                title: "1. เลือกครุภัณฑ์",
                detail: "ระบุตำแหน่งและชื่อให้ชัดเจน",
              },
              {
                icon: <EngineeringOutlined fontSize="small" />,
                title: "2. มอบหมายงาน",
                detail: "เลือกช่างและสถานะของแผน",
              },
              {
                icon: <EventRepeatOutlined fontSize="small" />,
                title: "3. กำหนดรอบ",
                detail: "ตรวจสอบกำหนดการก่อนบันทึก",
              },
            ].map((item, index) => (
              <Stack
                key={item.title}
                direction="row"
                spacing={1.25}
                sx={{
                  alignItems: "center",
                  px: 2,
                  py: 1.75,
                  borderLeft: { xs: 0, md: index === 0 ? 0 : 1 },
                  borderTop: { xs: index === 0 ? 0 : 1, md: 0 },
                  borderColor: "divider",
                }}
              >
                <Box sx={{ color: "primary.main", display: "flex" }}>
                  {item.icon}
                </Box>
                <Box>
                  <Typography variant="subtitle2">{item.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.detail}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Box>

          <Alert
            severity="info"
            icon={<CheckCircleOutlined />}
            sx={{
              alignItems: "center",
              border: 1,
              borderColor: "info.light",
              "& .MuiAlert-message": { py: 0.25 },
            }}
          >
            ระบบคำนวณวันครบกำหนดให้อัตโนมัติจากรอบตรวจ ส่วนวันสิ้นสุดแผนให้ผู้ใช้กำหนดเอง
            และต้องไม่ก่อนวันครบกำหนดครั้งถัดไป
          </Alert>

          <Box
            sx={{
              "& form > .MuiBox-root": { rowGap: 2.5 },
              "& .MuiTextField-root .MuiInputBase-root": {
                bgcolor: "background.paper",
              },
            }}
          >
            <GenericForm<PMForm>
              key={editing?.id ?? "new-pm"}
              fields={fields}
              schema={schema}
              defaultValues={defaults}
              deriveValues={deriveScheduleDates}
              columns={2}
              submitLabel={editing ? "บันทึกการแก้ไข" : "ตั้งรอบ PM"}
              onCancel={() => navigate("/pm")}
              onSubmit={(values) =>
                save.mutate({ ...values, ...deriveScheduleDates(values) })
              }
              isSubmitting={save.isPending}
            />
          </Box>
        </Stack>
      </MainCard>
    </Stack>
  );
}
