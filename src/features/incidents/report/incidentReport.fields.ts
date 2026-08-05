import { incidentCategories } from "../../../types/incident";
import type { FormField } from "../../../components/form/types";
import type { IncidentReportFormValues } from "./incidentReport.types";

export const incidentReportFields: FormField<IncidentReportFormValues>[] = [
  { name: "building", label: "อาคาร", readOnly: true, required: true },
  { name: "floor", label: "ชั้น", readOnly: true, required: true },
  { name: "assetName", label: "ชื่อจุด / ชิ้นงาน", readOnly: true, required: true, fullWidth: true },
  { name: "category", label: "ประเภทปัญหา", type: "select", required: true, options: incidentCategories.map((value) => ({ value, label: value })) },
  { name: "urgencyReported", label: "ระดับความเร่งด่วน", type: "select", required: true, options: [{ value: "critical", label: "วิกฤต — กระทบความปลอดภัยหรือการรักษา" }, { value: "urgent", label: "เร่งด่วน — ควรดำเนินการภายในวันนี้" }, { value: "normal", label: "ปกติ — ยังใช้งานพื้นที่ได้" }] },
  { name: "otherCategory", label: "โปรดระบุประเภทปัญหา", required: true, fullWidth: true, placeholder: "เช่น ประตูอัตโนมัติ, ระบบสื่อสาร หรืออุปกรณ์อื่น ๆ", visibleWhen: (values) => values.category === "อื่น ๆ" },
  { name: "description", label: "รายละเอียดปัญหา", type: "textarea", required: true, fullWidth: true, placeholder: "ระบุสิ่งที่พบ และผลกระทบต่อพื้นที่หรือการใช้งาน" },
  { name: "photos", label: "แนบภาพถ่าย (ถ้ามี)", type: "file", fullWidth: true },
];
