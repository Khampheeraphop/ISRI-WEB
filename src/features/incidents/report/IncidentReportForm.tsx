import { QrCode2Outlined } from "@mui/icons-material";
import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { MainCard } from "../../../components/base/MainCard";
import { GenericForm } from "../../../components/form/GenericForm";
import { useAuth } from "../../../hooks/useAuth";
import { createIncident, getLocationByCode } from "../incidentsApi";
import { incidentReportFields } from "./incidentReport.fields";
import { incidentReportSchema } from "./incidentReport.schema";
import type { IncidentReportFormValues } from "./incidentReport.types";

interface IncidentReportFormProps {
  locationCode: string;
  assetName?: string;
  onSubmitted: (ticketNumber: string) => void;
}

export function IncidentReportForm({ locationCode, assetName, onSubmitted }: IncidentReportFormProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const locationQuery = useQuery({ queryKey: ["location", locationCode], queryFn: () => getLocationByCode(locationCode) });
  const create = useMutation({ mutationFn: createIncident });

  if (!user) return null;
  if (user.role !== "reporter") return <Alert severity="info">บัญชีนี้ไม่มีสิทธิ์สร้างรายการแจ้งเหตุ</Alert>;
  if (locationQuery.isLoading) return <MainCard contentSx={{ py: 7 }}><Stack sx={{ alignItems: "center" }}><CircularProgress /></Stack></MainCard>;
  if (locationQuery.error || !locationQuery.data) return <Alert severity="error">{locationQuery.error instanceof Error ? locationQuery.error.message : "ไม่พบตำแหน่งจาก QR Code นี้"}</Alert>;

  const location = locationQuery.data;
  const qrAssetName = assetName ?? location.assetName;
  return (
    <MainCard
      title={<Typography variant="h5">รายละเอียดการแจ้งปัญหา</Typography>}
      subheader="กรอกข้อมูลที่จำเป็น เพื่อให้เจ้าหน้าที่เข้าดำเนินการได้ตรงจุด"
      contentSx={{ p: { xs: 2.5, md: 3.5 } }}
    >
      <Stack direction="row" spacing={1.2} sx={{ alignItems: "flex-start", mb: 3 }}>
        <QrCode2Outlined color="primary" sx={{ mt: 0.2 }} />
        <Box>
          <Typography variant="h6">ข้อมูลจาก QR Code</Typography>
          <Typography color="text.secondary">{location.building} · {location.floor} · {location.zone} ({locationCode})</Typography>
          {qrAssetName && <Typography variant="body2" color="text.secondary">ชิ้นงานจาก QR: {qrAssetName}</Typography>}
        </Box>
      </Stack>
      <Alert severity="info" variant="outlined" sx={{ mb: 3 }}>ตำแหน่งนี้อ่านจาก QR Code และไม่สามารถแก้ไขในหน้านี้ได้</Alert>
      {create.error && <Alert severity="error" sx={{ mb: 2 }}>{create.error instanceof Error ? create.error.message : "ไม่สามารถส่งรายการได้"}</Alert>}
      <GenericForm<IncidentReportFormValues>
        key={location.id}
        fields={incidentReportFields}
        schema={incidentReportSchema}
        defaultValues={{ building: location.building, floor: location.floor, zone: location.zone, assetName: qrAssetName ?? "", category: "ไฟฟ้า", urgencyReported: "normal", description: "", photos: [] }}
        submitLabel="ส่งแจ้งเหตุ"
        cancelLabel="ยกเลิก"
        onCancel={() => navigate("/incidents/mine")}
        isSubmitting={create.isPending}
        columns={2}
        onSubmit={async (values) => {
          const incident = await create.mutateAsync({ locationId: location.id, assetName: values.assetName, category: values.category, urgencyReported: values.urgencyReported, description: values.description, photos: values.photos ?? [] });
          onSubmitted(incident.ticketNumber);
        }}
      />
    </MainCard>
  );
}
