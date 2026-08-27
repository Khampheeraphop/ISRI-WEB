import * as yup from "yup";
import {
  incidentCategoryOptions,
  type IncidentCategoryCode,
} from "../../../types/incident";
import type { IncidentReportFormValues } from "./incidentReport.types";

export const incidentReportSchema: yup.ObjectSchema<IncidentReportFormValues> =
  yup.object({
    building: yup.string().required("ไม่พบข้อมูลอาคาร"),
    floor: yup.string().required("ไม่พบข้อมูลชั้น"),
    zone: yup.string().required("ไม่พบข้อมูลโซน"),
    assetName: yup.string().trim().required("กรุณาระบุชื่อชิ้นงาน"),
    category: yup
      .mixed<IncidentCategoryCode>()
      .oneOf(incidentCategoryOptions.map((option) => option.value))
      .required("กรุณาเลือกประเภทปัญหา"),
    description: yup
      .string()
      .trim()
      .required("กรุณาระบุรายละเอียดปัญหา")
      .min(10, "กรุณาระบุรายละเอียดอย่างน้อย 10 ตัวอักษร"),
    photos: yup.mixed<File[]>().optional(),
  });
