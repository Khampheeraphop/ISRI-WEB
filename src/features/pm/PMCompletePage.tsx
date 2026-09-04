import {
  ArrowBackOutlined,
  AssignmentOutlined,
  BuildOutlined,
  HistoryOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import * as yup from "yup";
import { MainCard } from "../../components/base/MainCard";
import { DetailSection } from "../../components/detail/DetailSection";
import { GenericForm } from "../../components/form/GenericForm";
import type { FormField } from "../../components/form/types";
import { useAuth } from "../../hooks/useAuth";
import type { PMLog } from "../../types/pm";
import { formatPMDate, getPMDueDetail, pmDateInput } from "./pm.constants";
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
    label: "งานที่ทำ ผลการตรวจ และหมายเหตุ",
    type: "textarea",
    required: true,
    fullWidth: true,
  },
];
const schema: yup.ObjectSchema<PMCompletionForm> = yup.object({
  completedAt: yup.string().required("กรุณาระบุวันที่ดำเนินการ"),
  notes: yup
    .string()
    .trim()
    .min(10, "กรุณาระบุรายละเอียดอย่างน้อย 10 ตัวอักษร")
    .max(4000, "ระบุรายละเอียดได้ไม่เกิน 4,000 ตัวอักษร")
    .required("กรุณาระบุงานที่ทำและผลการตรวจ"),
});
const formatRecordedAt = (date: string | null) =>
  date
    ? new Intl.DateTimeFormat("th-TH", {
      timeZone: "Asia/Bangkok",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(new Date(date)) + " น."
    : "ไม่พบวันเวลาที่บันทึก";

function PMLogDetail({ log }: { log: PMLog }) {
  return (
    <Stack spacing={1.5}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 0.5, sm: 3 }}
      >
        <Typography sx={{ fontWeight: 700 }}>
          วันที่ดำเนินการ: {formatPMDate(log.completedAt)}
        </Typography>
        <Typography>
          ผู้ปฏิบัติงาน: {log.technicianName ?? "ไม่ระบุชื่อ"}
        </Typography>
      </Stack>
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          งานที่ทำ ผลการตรวจ และหมายเหตุ
        </Typography>
        <Typography sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
          {log.notes || "ไม่ได้ระบุรายละเอียด"}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">
        บันทึกเมื่อ: {formatRecordedAt(log.createdAt)}
      </Typography>
    </Stack>
  );
}

export function PMCompletePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") === "history"
    ? "history"
    : "details";
  const changeTab = (tab: string) =>
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.set("tab", tab);
        return next;
      },
      { replace: true },
    );
  const [formVersion, setFormVersion] = useState(0);
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
    onSuccess: async (result) => {
      queryClient.setQueryData(
        ["pm-schedule", id],
        (current: typeof detail.data) => ({
          schedule: result.schedule,
          logs: [
            result.log,
            ...(current?.logs ?? []).filter((log) => log.id !== result.log.id),
          ],
        }),
      );
      setFormVersion((version) => version + 1);
      changeTab("history");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["pm-schedules"] }),
        queryClient.invalidateQueries({ queryKey: ["pm-schedule", id] }),
      ]);
    },
  });
  if (detail.isLoading) {
    return (
      <Box sx={{ minHeight: 320, display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }
  if (detail.isError || !detail.data) {
    return <Alert severity="warning">ไม่สามารถโหลดรายละเอียดแผน PM ได้</Alert>;
  }
  const { schedule } = detail.data;
  const logs = [...detail.data.logs].sort(
    (a, b) =>
      Date.parse(b.completedAt) - Date.parse(a.completedAt) ||
      Date.parse(b.createdAt ?? b.completedAt) -
        Date.parse(a.createdAt ?? a.completedAt),
  );
  const latest = logs[0];
  const canComplete = profile?.role === "technician";
  const due = getPMDueDetail(schedule);
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
        <Typography
          variant="h3"
          sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}
        >
          รายละเอียดและประวัติ PM
        </Typography>
        <Typography
          color="text.secondary"
          sx={{ mt: 0.5, overflowWrap: "anywhere" }}
        >
          {schedule.assetName} · {schedule.locationLabel}
        </Typography>
      </Box>
      {complete.isSuccess && (
        <Alert severity="success">
          บันทึกผล PM แล้ว สามารถตรวจสอบรายการได้ในประวัติการดำเนินงาน
        </Alert>
      )}
      {complete.isError && (
        <Alert severity="error">
          {complete.error instanceof Error
            ? complete.error.message
            : "ไม่สามารถบันทึกผล PM ได้"}
        </Alert>
      )}
      <Tabs
        value={activeTab}
        onChange={(_, value: string) => changeTab(value)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        aria-label="รายละเอียดและประวัติแผน PM"
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          maxWidth: 560,
          width: "100%",
          "& .MuiTab-root": {
            minWidth: 0,
            px: 1,
            fontSize: { xs: "0.85rem", sm: "0.95rem" },
          },
          "& .MuiTab-icon": { display: { xs: "none", sm: "inline-flex" } },
        }}
      >
        <Tab
          value="details"
          id="pm-tab-details"
          aria-controls="pm-panel-details"
          icon={<AssignmentOutlined />}
          iconPosition="start"
          label="รายละเอียดแผน"
        />
        <Tab
          value="history"
          id="pm-tab-history"
          aria-controls="pm-panel-history"
          icon={<HistoryOutlined />}
          iconPosition="start"
          label={`ประวัติการดำเนินงาน (${logs.length})`}
        />
      </Tabs>
      <Box
        role="tabpanel"
        id="pm-panel-details"
        aria-labelledby="pm-tab-details"
        hidden={activeTab !== "details"}
      >
        <Stack spacing={3}>
          <DetailSection
            title="ข้อมูลแผน PM"
            icon={<AssignmentOutlined />}
            fields={[
              { label: "ชิ้นงาน / ครุภัณฑ์", value: schedule.assetName },
              { label: "สถานที่", value: schedule.locationLabel },
              {
                label: "ช่างผู้รับผิดชอบ",
                value: schedule.assignedTechnicianName ?? "ยังไม่มอบหมายช่าง",
              },
              {
                label: "รอบการบำรุงรักษา",
                value: `ทุก ${schedule.intervalMonths} เดือน`,
              },
              {
                label: "วันที่ดำเนินการล่าสุด",
                value: formatPMDate(schedule.lastDoneAt),
              },
              {
                label: "กำหนดครั้งถัดไป",
                value: (
                  <Stack spacing={1} sx={{ alignItems: "flex-start" }}>
                    <Typography>{formatPMDate(schedule.nextDueAt)}</Typography>
                    <Chip
                      size="small"
                      color={due.color}
                      variant="outlined"
                      label={due.label}
                    />
                  </Stack>
                ),
              },
              {
                label: "รายละเอียดแผน / งานที่ต้องทำ",
                fullWidth: true,
                value: (
                  <Typography
                    sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
                  >
                    {schedule.planDetails || "ยังไม่ได้ระบุรายละเอียดแผน"}
                  </Typography>
                ),
              },
            ]}
          />
          <MainCard
            title={<Typography variant="h5">ผลการดำเนินการล่าสุด</Typography>}
            action={latest && (
              <Button
                size="small"
                onClick={() => changeTab("history")}
              >
                ดูประวัติทั้งหมด
              </Button>
            )}
          >
            {latest
              ? <PMLogDetail log={latest} />
              : (
                <Typography color="text.secondary">
                  ยังไม่มีบันทึกผล PM ของแผนนี้
                </Typography>
              )}
          </MainCard>
          {canComplete && (
            <MainCard
              title={
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center" }}
                >
                  <BuildOutlined color="primary" />
                  <Typography variant="h5">บันทึกผล PM รอบนี้</Typography>
                </Stack>
              }
              subheader={`กำหนดครั้งถัดไป ${formatPMDate(schedule.nextDueAt)}`}
            >
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                ระบุสิ่งที่ตรวจสอบ งานที่ทำ ผลที่พบ และสิ่งที่ต้องติดตาม เพื่อเก็บประวัติการบำรุงรักษา
              </Typography>
              <GenericForm<PMCompletionForm>
                key={`${id}-${formVersion}`}
                fields={fields}
                schema={schema}
                defaultValues={{ completedAt: pmDateInput(), notes: "" }}
                submitLabel="บันทึกผล PM"
                onCancel={() => navigate("/pm")}
                onSubmit={(values) => complete.mutate(values)}
                isSubmitting={complete.isPending}
              />
            </MainCard>
          )}
        </Stack>
      </Box>
      <Box
        role="tabpanel"
        id="pm-panel-history"
        aria-labelledby="pm-tab-history"
        hidden={activeTab !== "history"}
      >
        <MainCard
          title={<Typography variant="h5">ประวัติการดำเนินงาน</Typography>}
          subheader="เรียงตามวันที่ดำเนินการล่าสุด · วันเวลาที่บันทึกแสดงตามเวลาประเทศไทย"
        >
          <Stack spacing={3}>
            {logs.map((log) => (
              <Box
                key={log.id}
                sx={{
                  borderLeft: 3,
                  borderColor: "primary.light",
                  pl: { xs: 1.5, sm: 2.5 },
                  py: 0.5,
                }}
              >
                <PMLogDetail log={log} />
              </Box>
            ))}
            {!logs.length && (
              <Stack spacing={1} sx={{ alignItems: "flex-start" }}>
                <Typography color="text.secondary">
                  ยังไม่มีประวัติการดำเนินงาน เมื่อช่างบันทึกผล PM รายการจะแสดงที่นี่
                </Typography>
                {canComplete && (
                  <Button onClick={() => changeTab("details")}>
                    ไปบันทึกผล PM
                  </Button>
                )}
              </Stack>
            )}
          </Stack>
        </MainCard>
      </Box>
    </Stack>
  );
}
