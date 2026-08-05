import { QrCode2Outlined } from "@mui/icons-material";
import { Alert, Box, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { MainCard } from "../../../components/base/MainCard";
import { GenericForm } from "../../../components/form/GenericForm";
import { useAuth } from "../../../context/AuthContext";
import { useEntityMutation } from "../../../hooks/useEntity";
import { getLocationDetails } from "../../../utils/incident";
import { incidentReportFields } from "./incidentReport.fields";
import { incidentReportSchema } from "./incidentReport.schema";
import type { IncidentReportFormValues } from "./incidentReport.types";

interface IncidentReportFormProps { locationCode: string; onSubmitted: (ticketNumber: string) => void; }

export function IncidentReportForm({ locationCode, onSubmitted }: IncidentReportFormProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createIncident = useEntityMutation("incidents");
  const location = getLocationDetails(locationCode);
  return <MainCard title={<Typography variant="h5">รายละเอียดการแจ้งปัญหา</Typography>} subheader="กรอกข้อมูลที่จำเป็น เพื่อให้เจ้าหน้าที่เข้าดำเนินการได้ตรงจุด" contentSx={{ p: { xs: 2.5, md: 3.5 } }}>
    <Stack direction="row" spacing={1.2} sx={{ alignItems: "flex-start", mb: 3 }}><QrCode2Outlined color="primary" sx={{ mt: 0.2 }} /><Box><Typography variant="h6">ข้อมูลจาก QR Code</Typography><Typography color="text.secondary">{location.building} · {location.floor} · {location.assetName} ({locationCode})</Typography></Box></Stack>
    <Alert severity="info" variant="outlined" sx={{ mb: 3 }}>ตำแหน่งนี้อ่านจาก QR Code และไม่สามารถแก้ไขในหน้านี้ได้</Alert>
    <GenericForm<IncidentReportFormValues> fields={incidentReportFields} schema={incidentReportSchema} defaultValues={{ ...location, category: "ไฟฟ้า", urgencyReported: "normal", otherCategory: "", description: "", photos: [] }} submitLabel="ส่งแจ้งเหตุ" cancelLabel="ยกเลิก" onCancel={() => navigate("/incidents/mine")} isSubmitting={createIncident.isPending} columns={2} onSubmit={async (values) => { const incident = await createIncident.mutateAsync({ locationId: locationCode, locationLabel: `${values.building} · ${values.floor} · ${values.assetName}`, category: values.category, otherCategory: values.otherCategory, urgencyReported: values.urgencyReported, description: values.description, photoUrls: values.photos?.map((file) => file.name) ?? [], reporterId: user.id }); onSubmitted(incident.ticketNumber); }} />
  </MainCard>;
}
