import { LockOutlined, QrCode2Outlined } from "@mui/icons-material";
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

export function IncidentReportForm({
  locationCode,
  assetName,
  onSubmitted,
}: IncidentReportFormProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const locationQuery = useQuery({
    queryKey: ["location", locationCode],
    queryFn: () => getLocationByCode(locationCode),
  });
  const create = useMutation({ mutationFn: createIncident });

  if (!user) return null;
  if (user.role !== "reporter")
    return (
      <Alert severity="info">บัญชีนี้ไม่มีสิทธิ์สร้างรายการแจ้งเหตุ</Alert>
    );
  if (locationQuery.isLoading)
    return (
      <MainCard contentSx={{ py: 7 }}>
        <Stack sx={{ alignItems: "center" }}>
          <CircularProgress />
        </Stack>
      </MainCard>
    );
  if (locationQuery.error || !locationQuery.data)
    return (
      <Alert severity="error">
        {locationQuery.error instanceof Error
          ? locationQuery.error.message
          : "ไม่พบตำแหน่งจาก QR Code นี้"}
      </Alert>
    );

  const location = locationQuery.data;
  const qrAssetName = assetName ?? location.assetName;
  if (location.isReportingLocked)
    return (
      <MainCard contentSx={{ p: { xs: 3, md: 5 }, textAlign: "center" }}>
        <Stack spacing={1.25} sx={{ alignItems: "center" }}>
          <LockOutlined color="warning" sx={{ fontSize: 48 }} />
          <Typography variant="h5">จุดนี้อยู่ระหว่างดำเนินการ</Typography>
          <Typography color="text.secondary">
            QR Code นี้มีรายการแจ้งซ่อมที่ยังไม่เสร็จสิ้น จึงไม่สามารถแจ้งซ้ำได้
          </Typography>
          <Alert severity="info" sx={{ mt: 1, textAlign: "left" }}>
            เมื่อเจ้าหน้าที่ดำเนินการเสร็จสิ้นแล้ว จะสามารถสแกน QR Code
            นี้เพื่อแจ้งปัญหาใหม่ได้
          </Alert>
        </Stack>
      </MainCard>
    );
  return (
    <MainCard
      title={<Typography variant="h5">รายละเอียดการแจ้งปัญหา</Typography>}
      contentSx={{ p: { xs: 2.5, md: 3.5 } }}
    >
      <Stack
        direction="row"
        spacing={1.2}
        sx={{ alignItems: "flex-start", mb: 3 }}
      >
        <QrCode2Outlined color="primary" sx={{ mt: 0.2 }} />
        <Box>
          <Typography variant="h6">ข้อมูลจาก QR Code</Typography>
          <Typography color="text.secondary">
            {location.building} · {location.floor} · {location.zone}
          </Typography>
          {qrAssetName && (
            <Typography variant="body2" color="text.secondary">
              ชิ้นงานจาก QR: {qrAssetName}
            </Typography>
          )}
        </Box>
      </Stack>

      {create.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {create.error instanceof Error
            ? create.error.message
            : "ไม่สามารถส่งรายการได้"}
        </Alert>
      )}
      <GenericForm<IncidentReportFormValues>
        key={location.id}
        fields={incidentReportFields}
        schema={incidentReportSchema}
        defaultValues={{
          building: location.building,
          floor: location.floor,
          zone: location.zone,
          assetName: qrAssetName ?? "",
          category: "electrical",
          otherCategory: "",
          description: "",
          photos: [],
        }}
        submitLabel="ส่งแจ้งเหตุ"
        cancelLabel="ยกเลิก"
        onCancel={() => navigate("/incidents/mine")}
        isSubmitting={create.isPending}
        columns={2}
        onSubmit={async (values) => {
          const incident = await create.mutateAsync({
            locationId: location.id,
            assetName: values.assetName,
            category: values.category,
            otherCategory: values.otherCategory,
            description: values.description,
            photos: values.photos ?? [],
          });
          onSubmitted(incident.ticketNumber);
        }}
      />
    </MainCard>
  );
}
