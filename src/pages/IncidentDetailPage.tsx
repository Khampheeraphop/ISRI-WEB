import {
  ArrowBackOutlined,
  DescriptionOutlined,
  LocationOnOutlined,
  PersonOutlineOutlined,
  TimelineOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { Link, useParams } from "react-router-dom";
import { DetailSection } from "../components/detail/DetailSection";
import { IncidentStatusChip } from "../components/IncidentStatusChip";
import { PriorityRibbon } from "../components/PriorityRibbon";
import { useEntityQuery } from "../hooks/useEntity";
import { formatBangkokDate } from "../utils/incident";

export function IncidentDetailPage() {
  const { id } = useParams();
  const incidents = useEntityQuery("incidents");
  const users = useEntityQuery("users");
  const workOrders = useEntityQuery("workOrders");
  if (incidents.isLoading || users.isLoading || workOrders.isLoading) {
    return (
      <Box sx={{ minHeight: 320, display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  const incident = (incidents.data ?? []).find((item) => item.id === id);
  if (!incident)
    return <Alert severity="warning">ไม่พบรายการแจ้งซ่อมที่ต้องการ</Alert>;
  const reporter = (users.data ?? []).find(
    (item) => item.id === incident.reporterId,
  );
  const workOrder = (workOrders.data ?? []).find(
    (item) => item.incidentId === incident.id,
  );

  return (
    <Stack spacing={3}>
      <Box>
        <Button
          component={Link}
          to="/incidents/mine"
          startIcon={<ArrowBackOutlined />}
          sx={{ mb: 1 }}
        >
          กลับไปยังรายการแจ้งซ่อม
        </Button>
        <Typography variant="h3">รายละเอียดรายการแจ้งซ่อม</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          {incident.ticketNumber}
        </Typography>
      </Box>

      <Box sx={{ position: "relative" }}>
        <PriorityRibbon urgency={incident.urgencyReported} />
        <DetailSection
          title="ภาพรวมรายการ"
          icon={<DescriptionOutlined />}
          fields={[
            {
              label: "เลขที่ใบแจ้ง",
              value: (
                <Typography sx={{ fontWeight: 700 }}>
                  {incident.ticketNumber}
                </Typography>
              ),
            },
            {
              label: "สถานะปัจจุบัน",
              value: <IncidentStatusChip status={incident.status} />,
            },
            {
              label: "ประเภทปัญหา",
              value: (
                <Typography>
                  {incident.category}
                  {incident.otherCategory ? " — " + incident.otherCategory : ""}
                </Typography>
              ),
            },
            {
              label: "ระดับความเร่งด่วน",
              value: (
                <Chip
                  size="small"
                  color={
                    incident.urgencyReported === "critical"
                      ? "error"
                      : incident.urgencyReported === "urgent"
                        ? "warning"
                        : "info"
                  }
                  label={
                    incident.urgencyReported === "critical"
                      ? "วิกฤต"
                      : incident.urgencyReported === "urgent"
                        ? "เร่งด่วน"
                        : "ปกติ"
                  }
                />
              ),
            },
          ]}
        />
      </Box>

      <DetailSection
        title="รายละเอียดปัญหา"
        icon={<DescriptionOutlined />}
        fields={[
          {
            label: "รายละเอียดที่แจ้ง",
            value: (
              <Typography sx={{ whiteSpace: "pre-wrap" }}>
                {incident.description}
              </Typography>
            ),
            fullWidth: true,
          },
          {
            label: "ภาพประกอบ",
            value: incident.photoUrls.length ? (
              <Stack spacing={0.5}>
                {incident.photoUrls.map((file) => (
                  <Typography key={file} variant="body2">
                    {file}
                  </Typography>
                ))}
              </Stack>
            ) : (
              <Typography color="text.secondary">ไม่มีภาพประกอบ</Typography>
            ),
            fullWidth: true,
          },
        ]}
      />

      <DetailSection
        title="จุดแจ้งซ่อม"
        icon={<LocationOnOutlined />}
        fields={[
          {
            label: "ตำแหน่ง",
            value: <Typography>{incident.locationLabel}</Typography>,
          },
          {
            label: "รหัส QR / จุดแจ้ง",
            value: <Typography>{incident.locationId}</Typography>,
          },
        ]}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
          gap: 3,
        }}
      >
        <DetailSection
          title="ข้อมูลผู้แจ้ง"
          icon={<PersonOutlineOutlined />}
          fields={[
            {
              label: "ชื่อผู้แจ้ง",
              value: (
                <Typography>
                  {reporter?.name ?? "ไม่พบข้อมูลผู้แจ้ง"}
                </Typography>
              ),
            },
            {
              label: "วันที่แจ้ง",
              value: (
                <Typography>
                  {formatBangkokDate(incident.createdAt)} น.
                </Typography>
              ),
            },
          ]}
        />
        <DetailSection
          title="การดำเนินงาน"
          icon={<TimelineOutlined />}
          fields={[
            {
              label: "ใบสั่งงาน",
              value: (
                <Typography>
                  {workOrder?.id ?? "อยู่ระหว่างมอบหมายงาน"}
                </Typography>
              ),
            },
            {
              label: "สถานะงานซ่อม",
              value: (
                <Typography>
                  {workOrder
                    ? workOrder.status === "done"
                      ? "ดำเนินการเสร็จสิ้น"
                      : "อยู่ระหว่างดำเนินการ"
                    : "รอรับเรื่อง"}
                </Typography>
              ),
            },
          ]}
        />
      </Box>
    </Stack>
  );
}
