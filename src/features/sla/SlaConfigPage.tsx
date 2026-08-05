import { AlarmOnOutlined } from "@mui/icons-material";
import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material";
import * as yup from "yup";
import { MainCard } from "../../components/base/MainCard";
import { GenericForm } from "../../components/form/GenericForm";
import type { FormField } from "../../components/form/types";
import { useEntityQuery, useEntityUpdateMutation } from "../../hooks/useEntity";
import type { SLARule } from "../../types/workOrder";

type SlaFormValues = { responseMinutes: number; resolveMinutes: number };
const schema: yup.ObjectSchema<SlaFormValues> = yup.object({ responseMinutes: yup.number().typeError("กรุณาระบุเป็นตัวเลข").integer().min(1, "ต้องมากกว่า 0").required(), resolveMinutes: yup.number().typeError("กรุณาระบุเป็นตัวเลข").integer().min(1, "ต้องมากกว่า 0").required() });
const fields: FormField<SlaFormValues>[] = [{ name: "responseMinutes", label: "เวลาตอบรับ (นาที)", type: "number", required: true }, { name: "resolveMinutes", label: "เวลาแก้ไข (นาที)", type: "number", required: true }];
const urgencyDetails = { critical: { title: "วิกฤต", description: "กระทบความปลอดภัยหรือการรักษา", color: "#C1443A" }, urgent: { title: "เร่งด่วน", description: "ควรดำเนินการภายในวันนี้", color: "#C68A2E" }, normal: { title: "ปกติ", description: "ยังใช้งานพื้นที่ได้", color: "#3E6FA6" } } as const;

function SlaRuleEditor({ rule }: { rule: SLARule }) {
  const updateRule = useEntityUpdateMutation("slaRules");
  const detail = urgencyDetails[rule.urgencyLevel];
  return <MainCard title={<Stack direction="row" spacing={1} sx={{ alignItems: "center" }}><Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: detail.color }} /><Typography variant="h6">{detail.title}</Typography></Stack>} subheader={detail.description}><GenericForm<SlaFormValues> key={rule.id} fields={fields} schema={schema} defaultValues={{ responseMinutes: rule.responseMinutes, resolveMinutes: rule.resolveMinutes }} submitLabel="บันทึก" isSubmitting={updateRule.isPending} onSubmit={(values) => updateRule.mutate({ id: rule.id, changes: values })} /></MainCard>;
}

export function SlaConfigPage() {
  const rules = useEntityQuery("slaRules");
  const orders = useEntityQuery("workOrders");
  const overdueCount = (orders.data ?? []).filter((order) => new Date(order.resolveDueAt).getTime() < Date.now()).length;
  if (rules.isLoading) return <Box sx={{ minHeight: 320, display: "grid", placeItems: "center" }}><CircularProgress /></Box>;
  return <Stack spacing={3}><Box><Typography variant="h3">ตั้งค่า SLA</Typography><Typography color="text.secondary" sx={{ mt: 0.5 }}>กำหนดเวลาตอบรับและเวลาแก้ไขตามระดับความเร่งด่วน</Typography></Box>{overdueCount > 0 && <Alert severity="error" icon={<AlarmOnOutlined />}>มีงานที่เกิน SLA {overdueCount} รายการ โปรดตรวจสอบหน้าคิวงานช่าง</Alert>}<Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "repeat(3, minmax(0, 1fr))" }, gap: 2.5 }}>{(rules.data ?? []).map((rule) => <SlaRuleEditor key={rule.id} rule={rule} />)}</Box></Stack>;
}
