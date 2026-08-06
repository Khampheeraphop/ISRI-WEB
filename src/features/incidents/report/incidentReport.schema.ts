import * as yup from "yup";
import { incidentCategories, type IncidentCategory, type UrgencyLevel } from "../../../types/incident";
import type { IncidentReportFormValues } from "./incidentReport.types";

export const incidentReportSchema: yup.ObjectSchema<IncidentReportFormValues> = yup.object({
  building: yup.string().required("ไม่พบข้อมูลอาคาร"),
  floor: yup.string().required("ไม่พบข้อมูลชั้น"),
  zone: yup.string().required("ไม่พบข้อมูลโซน"),
  assetName: yup.string().trim().required("กรุณาระบุชื่อชิ้นงาน"),
  category: yup.mixed<IncidentCategory>().oneOf(incidentCategories).required("กรุณาเลือกประเภทปัญหา"),
  otherCategory: yup.string().when("category", { is: "อื่น ๆ", then: (schema) => schema.trim().required("กรุณาระบุประเภทปัญหา"), otherwise: (schema) => schema.strip() }),
  urgencyReported: yup.mixed<UrgencyLevel>().oneOf(["critical", "urgent", "normal"]).required("กรุณาเลือกระดับความเร่งด่วน"),
  description: yup.string().trim().required("กรุณาระบุรายละเอียดปัญหา").min(10, "กรุณาระบุรายละเอียดอย่างน้อย 10 ตัวอักษร"),
  photos: yup.mixed<File[]>().optional(),
});
