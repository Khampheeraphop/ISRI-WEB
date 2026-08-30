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
    otherCategory: yup
      .string()
      .trim()
      .when("category", {
        is: "other",
        then: (schema) =>
          schema
            .required("กรุณาระบุประเภทปัญหาอื่น ๆ")
            .min(2, "กรุณาระบุอย่างน้อย 2 ตัวอักษร")
            .max(120, "ระบุได้ไม่เกิน 120 ตัวอักษร"),
        otherwise: (schema) => schema.optional().strip(),
      }),
    description: yup
      .string()
      .trim()
      .required("กรุณาระบุรายละเอียดปัญหา")
      .min(10, "กรุณาระบุรายละเอียดอย่างน้อย 10 ตัวอักษร"),
    photos: yup.mixed<File[]>().optional(),
  });
