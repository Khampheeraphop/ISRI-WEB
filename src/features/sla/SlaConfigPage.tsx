import {
  AccessTimeRounded,
  BoltRounded,
  CrisisAlertRounded,
  InfoOutlined,
  StarsRounded,
} from "@mui/icons-material";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  InputAdornment,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import {
  Controller,
  useForm,
  useWatch,
  type Resolver,
} from "react-hook-form";
import * as yup from "yup";
import type { SLARule } from "../../types/workOrder";
import { getSlaRules, updateSlaRule } from "./slaApi";

type SlaFormValues = {
  responseMinutes: number;
  resolveMinutes: number;
  pointValue: number;
};

const schema: yup.ObjectSchema<SlaFormValues> = yup.object({
  responseMinutes: yup
    .number()
    .typeError("กรุณาระบุเป็นตัวเลข")
    .integer("กรุณาระบุเป็นจำนวนเต็ม")
    .min(1, "ต้องมากกว่า 0 นาที")
    .required("กรุณาระบุเวลาตอบรับ"),
  resolveMinutes: yup
    .number()
    .typeError("กรุณาระบุเป็นตัวเลข")
    .integer("กรุณาระบุเป็นจำนวนเต็ม")
    .min(yup.ref("responseMinutes"), "ต้องไม่น้อยกว่าเวลาตอบรับ")
    .required("กรุณาระบุเวลาปิดงาน"),
  pointValue: yup
    .number()
    .typeError("กรุณาระบุเป็นตัวเลข")
    .integer("กรุณาระบุเป็นจำนวนเต็ม")
    .min(1, "ต้องมากกว่า 0 คะแนน")
    .max(1_000_000, "คะแนนสูงเกินกำหนด")
    .required("กรุณาระบุคะแนน"),
});

const urgencyDetails: Record<
  SLARule["urgencyLevel"],
  {
    title: string;
    description: string;
    color: string;
    softColor: string;
    icon: ReactNode;
    order: number;
  }
> = {
  critical: {
    title: "วิกฤต",
    description: "กระทบต่อความปลอดภัยหรือการรักษา",
    color: "#B93C35",
    softColor: "#FFF1F0",
    icon: <CrisisAlertRounded />,
    order: 0,
  },
  urgent: {
    title: "เร่งด่วน",
    description: "ต้องเร่งดำเนินการภายในวันเดียวกัน",
    color: "#A9660D",
    softColor: "#FFF7E8",
    icon: <BoltRounded />,
    order: 1,
  },
  normal: {
    title: "ปกติ",
    description: "พื้นที่ยังใช้งานได้และไม่กระทบการรักษา",
    color: "#356D9F",
    softColor: "#EEF6FC",
    icon: <AccessTimeRounded />,
    order: 2,
  },
};

function formatDuration(value?: number) {
  const minutes = Number(value);
  if (!Number.isFinite(minutes) || minutes < 1) return "—";
  if (minutes % 1_440 === 0) return `${minutes / 1_440} วัน`;
  if (minutes >= 1_440) {
    const days = Math.floor(minutes / 1_440);
    const hours = Math.floor((minutes % 1_440) / 60);
    return hours ? `${days} วัน ${hours} ชม.` : `${days} วัน`;
  }
  if (minutes % 60 === 0) return `${minutes / 60} ชม.`;
  if (minutes > 60) {
    return `${Math.floor(minutes / 60)} ชม. ${minutes % 60} นาที`;
  }
  return `${minutes} นาที`;
}

function SummaryValue({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        sx={{ color: "#6B627B", fontSize: ".72rem", lineHeight: 1.4 }}
      >
        {label}
      </Typography>
      <Typography
        sx={{ mt: 0.35, color: "#292139", fontSize: ".92rem", fontWeight: 700 }}
      >
        {value}
      </Typography>
    </Box>
  );
}

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
  const {
    control,
    handleSubmit,
    formState: { isDirty },
  } = useForm<SlaFormValues>({
    defaultValues: {
      responseMinutes: rule.responseMinutes,
      resolveMinutes: rule.resolveMinutes,
      pointValue: rule.pointValue,
    },
    resolver: yupResolver(schema) as unknown as Resolver<SlaFormValues>,
    mode: "onTouched",
    reValidateMode: "onChange",
  });
  const values = useWatch({ control });

  return (
    <Card
      component="article"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: "1px solid #DDD6E9",
        borderTop: `4px solid ${detail.color}`,
        borderRadius: 2.5,
        boxShadow: "0 8px 24px rgba(48,35,82,.055)",
      }}
    >
      <Box sx={{ px: { xs: 2.25, sm: 2.75 }, py: 2.5 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              flex: "0 0 auto",
              display: "grid",
              placeItems: "center",
              borderRadius: 2,
              color: detail.color,
              bgcolor: detail.softColor,
            }}
          >
            {detail.icon}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Typography variant="h6">ระดับ{detail.title}</Typography>
              <Chip
                size="small"
                label={detail.title}
                sx={{
                  height: 22,
                  color: detail.color,
                  bgcolor: detail.softColor,
                  fontSize: ".68rem",
                  fontWeight: 700,
                }}
              />
            </Stack>
            <Typography
              sx={{ mt: 0.45, color: "#665D75", fontSize: ".82rem", lineHeight: 1.55 }}
            >
              {detail.description}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Divider />

      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        sx={{
          p: { xs: 2.25, sm: 2.75 },
          pt: { xs: 2.5, sm: 3 },
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Stack spacing={2.25}>
          <Controller
            name="responseMinutes"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                value={field.value ?? ""}
                onChange={(event) =>
                  field.onChange(
                    event.target.value === ""
                      ? undefined
                      : Number(event.target.value),
                  )
                }
                required
                fullWidth
                type="number"
                label="ตอบรับภายใน"
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
                slotProps={{
                  htmlInput: { min: 1, inputMode: "numeric" },
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">นาที</InputAdornment>
                    ),
                  },
                  formHelperText: { sx: { ml: 0 } },
                }}
              />
            )}
          />
          <Controller
            name="resolveMinutes"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                value={field.value ?? ""}
                onChange={(event) =>
                  field.onChange(
                    event.target.value === ""
                      ? undefined
                      : Number(event.target.value),
                  )
                }
                required
                fullWidth
                type="number"
                label="ปิดงานภายใน"
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
                slotProps={{
                  htmlInput: { min: 1, inputMode: "numeric" },
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">นาที</InputAdornment>
                    ),
                  },
                  formHelperText: { sx: { ml: 0 } },
                }}
              />
            )}
          />
          <Controller
            name="pointValue"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                value={field.value ?? ""}
                onChange={(event) =>
                  field.onChange(
                    event.target.value === ""
                      ? undefined
                      : Number(event.target.value),
                  )
                }
                required
                fullWidth
                type="number"
                label="คะแนนเมื่อปิดงาน"
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
                slotProps={{
                  htmlInput: { min: 1, max: 1_000_000, inputMode: "numeric" },
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">คะแนน</InputAdornment>
                    ),
                  },
                  formHelperText: { sx: { ml: 0 } },
                }}
              />
            )}
          />
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 1.25,
            mt: 2.25,
            p: 1.5,
            borderRadius: 2,
            bgcolor: "#F8F6FB",
            border: "1px solid #ECE7F3",
          }}
        >
          <SummaryValue
            label="ตอบรับ"
            value={formatDuration(values.responseMinutes)}
          />
          <SummaryValue
            label="ปิดงาน"
            value={formatDuration(values.resolveMinutes)}
          />
          <SummaryValue
            label="รางวัล"
            value={`${Number(values.pointValue) || 0} คะแนน`}
          />
        </Box>

        <Stack
          direction="row"
          spacing={1}
          sx={{ mt: 1.5, color: "#6B627B", alignItems: "center" }}
        >
          <StarsRounded sx={{ fontSize: 17, color: "#8064B3" }} />
          <Typography sx={{ fontSize: ".75rem", lineHeight: 1.5 }}>
            มอบคะแนนแก่ผู้แจ้งเมื่อปิดงานสำเร็จ
          </Typography>
        </Stack>

        <Button
          fullWidth
          type="submit"
          variant="contained"
          disabled={isSubmitting || !isDirty}
          sx={{
            minHeight: 46,
            mt: 2.5,
            borderRadius: 2,
            bgcolor: "#493783",
            "&:hover": { bgcolor: "#39296F" },
          }}
        >
          {isSubmitting
            ? "กำลังบันทึก..."
            : isDirty
              ? `บันทึก`
              : "บันทึก"}
        </Button>
      </Box>
    </Card>
  );
}

export function SlaConfigPage() {
  const queryClient = useQueryClient();
  const rules = useQuery({ queryKey: ["sla-rules"], queryFn: getSlaRules });
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
        message: `บันทึก SLA ระดับ${urgencyDetails[variables.urgencyLevel].title}สำเร็จ`,
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

  if (rules.isLoading) {
    return (
      <Box sx={{ minHeight: 360, display: "grid", placeItems: "center" }}>
        <Stack spacing={1.5} sx={{ alignItems: "center" }}>
          <CircularProgress aria-label="กำลังโหลดการตั้งค่า SLA" />
          <Typography color="text.secondary">กำลังโหลดการตั้งค่า...</Typography>
        </Stack>
      </Box>
    );
  }

  const sortedRules = [...(rules.data ?? [])].sort(
    (a, b) =>
      urgencyDetails[a.urgencyLevel].order - urgencyDetails[b.urgencyLevel].order,
  );

  return (
    <Stack spacing={{ xs: 2.5, md: 3 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
        }}
      >
        <Box>
          <Typography
            variant="overline"
            sx={{ color: "#654E98", fontWeight: 700, letterSpacing: ".08em" }}
          >
            การตั้งค่าระบบ
          </Typography>
          <Typography variant="h3" component="h1">
            ตั้งค่า SLA
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            กำหนดกรอบเวลาการให้บริการและคะแนนตามระดับความเร่งด่วน
          </Typography>
        </Box>
      </Stack>

      {rules.isError && (
        <Alert severity="error">ไม่สามารถโหลดการตั้งค่า SLA ได้</Alert>
      )}
      {!rules.isError && sortedRules.length === 0 && (
        <Alert severity="warning">
          ยังไม่พบกติกา SLA ในระบบ โปรดตรวจสอบการตั้งค่าฐานข้อมูล
        </Alert>
      )}

      <Box
        role="note"
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1.25,
          p: { xs: 1.75, sm: 2 },
          borderRadius: 2.5,
          color: "#344865",
          bgcolor: "#F3F8FC",
          border: "1px solid #D8E8F3",
        }}
      >
        <InfoOutlined sx={{ mt: "2px", color: "#3E6FA6", flex: "0 0 auto" }} />
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: ".9rem" }}>
            การเปลี่ยนแปลงมีผลกับงานใหม่เท่านั้น
          </Typography>
          <Typography sx={{ mt: 0.25, fontSize: ".82rem", lineHeight: 1.65 }}>
            งานที่มอบหมายแล้วจะใช้กำหนดเวลาเดิม เพื่อรักษาความถูกต้องของประวัติการดำเนินงาน
          </Typography>
        </Box>
      </Box>

      {sortedRules.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              md: "repeat(2, minmax(0, 1fr))",
              xl: "repeat(3, minmax(0, 1fr))",
            },
            gap: { xs: 2, md: 2.5 },
            alignItems: "stretch",
          }}
        >
          {sortedRules.map((rule) => (
            <SlaRuleEditor
              key={`${rule.id}:${rule.responseMinutes}:${rule.resolveMinutes}:${rule.pointValue}`}
              rule={rule}
              isSubmitting={
                updateRule.isPending && updateRule.variables?.id === rule.id
              }
              onSubmit={(values) =>
                updateRule.mutate({
                  id: rule.id,
                  urgencyLevel: rule.urgencyLevel,
                  ...values,
                })
              }
              onInvalid={() =>
                setFeedback({
                  severity: "error",
                  message: `กรุณาตรวจสอบข้อมูล SLA ระดับ${urgencyDetails[rule.urgencyLevel].title}`,
                })
              }
            />
          ))}
        </Box>
      )}

      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={5000}
        onClose={() => setFeedback(undefined)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
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
