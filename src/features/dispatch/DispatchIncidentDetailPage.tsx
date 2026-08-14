import {
  ArrowBackOutlined,
  AssignmentIndOutlined,
  DescriptionOutlined,
  LocationOnOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MainCard } from "../../components/base/MainCard";
import { DetailSection } from "../../components/detail/DetailSection";
import { IncidentStatusChip } from "../../components/IncidentStatusChip";
import { PriorityRibbon } from "../../components/PriorityRibbon";
import { formatBangkokDate } from "../../utils/incident";
import {
  assignWorkOrder,
  getDispatchIncidentDetail,
  getDispatchTechnicians,
} from "./dispatchApi";

const urgencyLabels = {
  critical: "วิกฤต",
  urgent: "เร่งด่วน",
  normal: "ปกติ",
} as const;

export function DispatchIncidentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const client = useQueryClient();
  const [technicianId, setTechnicianId] = useState("");
  const [urgencyVerified, setUrgencyVerified] = useState<
    "critical" | "urgent" | "normal"
  >("normal");
  const detail = useQuery({
    queryKey: ["dispatch-incident", id],
    queryFn: () => getDispatchIncidentDetail(id ?? ""),
    enabled: Boolean(id),
  });
  const technicians = useQuery({
    queryKey: ["dispatch-technicians"],
    queryFn: getDispatchTechnicians,
  });
  const assign = useMutation({
    mutationFn: assignWorkOrder,
    onSuccess: async (workOrder) => {
      await client.invalidateQueries({ queryKey: ["dispatch-incidents"] });
      navigate(`/work-orders/${workOrder.id}`, { replace: true });
    },
  });

  if (detail.isLoading || technicians.isLoading) {
    return (
      <Box sx={{ minHeight: 320, display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }
  if (detail.error || !detail.data) {
    return (
      <Alert severity="error">
        {detail.error instanceof Error
          ? detail.error.message
          : "ไม่พบรายการรอจัดสรร"}
      </Alert>
    );
  }

  const incident = detail.data;
  return (
    <Stack spacing={3}>
      <Box>
        <Button
          component={Link}
          to="/dispatch"
          startIcon={<ArrowBackOutlined />}
          sx={{ mb: 1 }}
        >
          กลับไปคิวรอจัดสรรงาน
        </Button>
        <Typography variant="h3">รายละเอียดรายการแจ้งซ่อม</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          {incident.ticketNumber}
        </Typography>
      </Box>

      <Box sx={{ position: "relative" }}>
        <PriorityRibbon urgency={incident.urgencyReported} />
        <DetailSection
          title="ข้อมูลคำขอ"
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
              label: "สถานะ",
              value: <IncidentStatusChip status={incident.status} />,
            },
            {
              label: "ประเภทปัญหา",
              value: <Typography>{incident.category}</Typography>,
            },
            {
              label: "ระดับความเร่งด่วน",
              value: (
                <Typography>
                  {urgencyLabels[incident.urgencyReported]}
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
                      overflow: "hidden",
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1.5,
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

      <MainCard
        title={
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <AssignmentIndOutlined color="primary" />
            <Typography variant="h5">มอบหมายผู้รับผิดชอบ</Typography>
          </Stack>
        }
        subheader="ตรวจสอบข้อมูลข้างต้น แล้วเลือกช่างที่ตรงกับลักษณะงาน"
      >
        <Stack spacing={2}>
          {technicians.error && (
            <Alert severity="error">
              {technicians.error instanceof Error
                ? technicians.error.message
                : "ไม่สามารถโหลดรายชื่อช่างได้"}
            </Alert>
          )}
          <Select
            displayEmpty
            value={technicianId}
            onChange={(event) => setTechnicianId(event.target.value)}
            sx={{ maxWidth: 560 }}
          >
            <MenuItem value="" disabled>
              เลือกช่างผู้รับผิดชอบ
            </MenuItem>
            {(technicians.data ?? []).map((technician) => (
              <MenuItem key={technician.id} value={technician.id}>
                {technician.full_name} —{" "}
                {technician.technician_specialties.join(", ") ||
                  "ยังไม่ได้ระบุความเชี่ยวชาญ"}
              </MenuItem>
            ))}
          </Select>
          <Box sx={{ maxWidth: 560 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.75 }}>
              ระดับความเร่งด่วนที่ผู้จัดสรรยืนยัน
            </Typography>
            <Select
              fullWidth
              value={urgencyVerified}
              onChange={(event) =>
                setUrgencyVerified(
                  event.target.value as "critical" | "urgent" | "normal",
                )
              }
            >
              <MenuItem value="critical">วิกฤต</MenuItem>
              <MenuItem value="urgent">เร่งด่วน</MenuItem>
              <MenuItem value="normal">ปกติ</MenuItem>
            </Select>
            <Typography variant="caption" color="text.secondary">
              SLA และแต้มจะยึดค่าที่ตรวจสอบแล้ว ไม่ยึดค่าที่ผู้แจ้งเลือกเอง
            </Typography>
          </Box>
          {assign.error && (
            <Alert severity="error">
              {assign.error instanceof Error
                ? assign.error.message
                : "ไม่สามารถมอบหมายงานได้"}
            </Alert>
          )}
          <Box>
            <Button
              variant="contained"
              disabled={!technicianId || assign.isPending}
              onClick={() =>
                assign.mutate({
                  incidentId: incident.id,
                  technicianId,
                  urgencyVerified,
                })
              }
            >
              มอบหมายงาน
            </Button>
          </Box>
        </Stack>
      </MainCard>
    </Stack>
  );
}
