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
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { DetailSection } from "../components/detail/DetailSection";
import { IncidentStatusChip } from "../components/IncidentStatusChip";
import { PriorityRibbon } from "../components/PriorityRibbon";
import { getMyIncidentDetail } from "../features/incidents/incidentsApi";
import { useAuth } from "../hooks/useAuth";
import { formatBangkokDate } from "../utils/incident";

const urgencyLabel = {
  critical: "วิกฤต",
  urgent: "เร่งด่วน",
  normal: "ปกติ",
} as const;

export function IncidentDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const detail = useQuery({
    queryKey: ["incident", id],
    queryFn: () => getMyIncidentDetail(id ?? ""),
    enabled: Boolean(id),
  });
  if (detail.isLoading)
    return (
      <Box sx={{ minHeight: 320, display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  if (detail.error || !detail.data)
    return (
      <Alert severity="error">
        {detail.error instanceof Error
          ? detail.error.message
          : "ไม่พบรายการแจ้งซ่อมที่ต้องการ"}
      </Alert>
    );
  const incident = detail.data;

  return (
    <Stack spacing={3}>
      <Box>
        <Button
          component={Link}
          to="/incidents/mine"
          startIcon={<ArrowBackOutlined />}
          sx={{ mb: 1 }}
        >
          กลับไปรายการแจ้งซ่อม
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
              value: <Typography>{incident.category}</Typography>,
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
                  label={urgencyLabel[incident.urgencyReported]}
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
            value: incident.attachments.length ? (
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ flexWrap: "wrap", rowGap: 1.5 }}
              >
                {incident.attachments.map((file) => (
                  <Box
                    key={file.url}
                    component="a"
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    sx={{
                      width: 132,
                      height: 96,
                      borderRadius: 1.5,
                      overflow: "hidden",
                      border: 1,
                      borderColor: "divider",
                    }}
                  >
                    <Box
                      component="img"
                      src={file.url}
                      alt={file.fileName}
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </Box>
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
            label: "ชื่อชิ้นงาน",
            value: (
              <Typography>{incident.assetName || "ไม่ได้ระบุ"}</Typography>
            ),
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
              value: <Typography>{user?.name}</Typography>,
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
            { label: "ใบสั่งงาน", value: <Typography>รอรับเรื่อง</Typography> },
            {
              label: "สถานะงานซ่อม",
              value: <Typography>ยังไม่มีการมอบหมายงาน</Typography>,
            },
          ]}
        />
      </Box>
    </Stack>
  );
}
