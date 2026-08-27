import { AlarmOnOutlined } from "@mui/icons-material";
import {
  Alert,
  Box,
  CircularProgress,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import * as yup from "yup";
import { MainCard } from "../../components/base/MainCard";
import { GenericForm } from "../../components/form/GenericForm";
import type { FormField } from "../../components/form/types";
import type { SLARule } from "../../types/workOrder";
import { getSlaRules, getSlaSummary, updateSlaRule } from "./slaApi";

type SlaFormValues = {
  responseMinutes: number;
  resolveMinutes: number;
  pointValue: number;
};

const schema: yup.ObjectSchema<SlaFormValues> = yup.object({
  responseMinutes: yup.number().typeError("กรุณาระบุเป็นตัวเลข").integer().min(1, "ต้องมากกว่า 0").required("กรุณาระบุเวลาตอบรับ"),
  resolveMinutes: yup.number().typeError("กรุณาระบุเป็นตัวเลข").integer().min(yup.ref("responseMinutes"), "ต้องไม่น้อยกว่าเวลาตอบรับ").required("กรุณาระบุเวลาปิดงาน"),
  pointValue: yup.number().typeError("กรุณาระบุเป็นตัวเลข").integer().min(1, "ต้องมากกว่า 0").max(1_000_000, "คะแนนสูงเกินกำหนด").required("กรุณาระบุคะแนน"),
});

const fields: FormField<SlaFormValues>[] = [
  { name: "responseMinutes", label: "เวลาตอบรับ (นาที)", type: "number", required: true },
  { name: "resolveMinutes", label: "เวลาปิดงาน (นาที)", type: "number", required: true },
  {
    name: "pointValue",
    label: "คะแนนเมื่อปิดงาน",
    type: "number",
    description: "ระบบให้คะแนนนี้แก่ผู้แจ้งเมื่อปิดงานสำเร็จ",
    required: true,
  },
];

const urgencyDetails = {
  critical: { title: "วิกฤต", description: "กระทบความปลอดภัยหรือการรักษา", color: "#C1443A" },
  urgent: { title: "เร่งด่วน", description: "ควรดำเนินการภายในวันนี้", color: "#C68A2E" },
  normal: { title: "ปกติ", description: "ยังใช้งานพื้นที่ได้", color: "#3E6FA6" },
} as const;

function SlaRuleEditor({
  rule,
  isSubmitting,
  onSubmit,
  onInvalid,
}: {
  rule: SLARule;
  isSubmitting: boolean;
  onSubmit: (values: SlaFormValues) => void;
  onInvalid: () => void;
}) {
  const detail = urgencyDetails[rule.urgencyLevel];
  return (
    <MainCard
      title={<Stack direction="row" spacing={1} sx={{ alignItems: "center" }}><Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: detail.color }} /><Typography variant="h6">{detail.title}</Typography></Stack>}
      subheader={detail.description}
    >
      <GenericForm<SlaFormValues>
        key={rule.id}
        fields={fields}
        schema={schema}
        defaultValues={{ responseMinutes: rule.responseMinutes, resolveMinutes: rule.resolveMinutes, pointValue: rule.pointValue }}
        submitLabel={`บันทึก SLA ระดับ${detail.title}`}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        onInvalid={onInvalid}
      />
    </MainCard>
  );
}

export function SlaConfigPage() {
  const queryClient = useQueryClient();
  const rules = useQuery({ queryKey: ["sla-rules"], queryFn: getSlaRules });
  const summary = useQuery({ queryKey: ["sla-summary"], queryFn: getSlaSummary });
  const [feedback, setFeedback] = useState<{
    severity: "success" | "error";
    message: string;
  }>();
  const updateRule = useMutation({
    mutationFn: ({ urgencyLevel: _urgencyLevel, ...input }: SlaFormValues & {
      id: string;
      urgencyLevel: SLARule["urgencyLevel"];
    }) => updateSlaRule(input),
    onSuccess: async (_rule, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["sla-rules"] }),
        queryClient.invalidateQueries({ queryKey: ["sla-summary"] }),
      ]);
      setFeedback({
        severity: "success",
        message: `บันทึก SLA ระดับ${urgencyDetails[variables.urgencyLevel].title} สำเร็จ`,
      });
    },
    onError: (error) =>
      setFeedback({
        severity: "error",
        message:
          error instanceof Error
            ? error.message
            : "ไม่สามารถบันทึกการตั้งค่า SLA ได้",
      }),
  });

  if (rules.isLoading)
    return <Box sx={{ minHeight: 320, display: "grid", placeItems: "center" }}><CircularProgress /></Box>;

  const overdueCount = summary.data?.data.overdueCount ?? 0;
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3">ตั้งค่า SLA</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          กำหนดเวลาตอบรับ เวลาปิดงาน และคะแนนตามระดับความเร่งด่วน
        </Typography>
      </Box>
      {rules.isError && <Alert severity="error">ไม่สามารถโหลดการตั้งค่า SLA ได้</Alert>}
      <Alert severity="info">
        การปรับ SLA มีผลกับงานที่มอบหมายหลังจากนี้ งานที่มอบหมายแล้วจะคงกำหนดเดิมเพื่อให้ตรวจสอบประวัติได้
      </Alert>
      {overdueCount > 0 && <Alert severity="error" icon={<AlarmOnOutlined />}>มีงานที่เกิน SLA {overdueCount} รายการ โปรดตรวจสอบคิวงานช่าง</Alert>}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "repeat(3, minmax(0, 1fr))" }, gap: 2.5 }}>
        {(rules.data ?? []).map((rule) => (
          <SlaRuleEditor
            key={rule.id}
            rule={rule}
            isSubmitting={updateRule.isPending}
            onSubmit={(values) =>
              updateRule.mutate({ id: rule.id, urgencyLevel: rule.urgencyLevel, ...values })
            }
            onInvalid={() =>
              setFeedback({
                severity: "error",
                message: `กรุณากรอกข้อมูล SLA ระดับ${urgencyDetails[rule.urgencyLevel].title} ให้ครบและถูกต้อง`,
              })
            }
          />
        ))}
      </Box>
      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={5000}
        onClose={() => setFeedback(undefined)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={feedback?.severity ?? "success"}
          variant="filled"
          onClose={() => setFeedback(undefined)}
        >
          {feedback?.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
