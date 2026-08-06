import {
  ArrowBackOutlined,
  BuildOutlined,
  DescriptionOutlined,
  LocationOnOutlined,
  PersonOutlineOutlined,
  PhotoCameraBackOutlined,
  ScheduleOutlined,
  TimelineOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Collapse,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { DetailSection } from "../../components/detail/DetailSection";
import { ImageUploadField } from "../../components/form/fields/ImageUploadField";
import { IncidentStatusChip } from "../../components/IncidentStatusChip";
import { MainCard } from "../../components/base/MainCard";
import { PriorityRibbon } from "../../components/PriorityRibbon";
import { SlaCountdown } from "../../components/SlaCountdown";
import { useEntityQuery } from "../../hooks/useEntity";
import { formatBangkokDate } from "../../utils/incident";
import { workOrderStatusDetail } from "./workOrder.constants";
import { useWorkOrderActions } from "./useWorkOrderActions";

const formatMinutes = (minutes: number) =>
  minutes % 60 === 0
    ? String(minutes / 60) + " ชั่วโมง"
    : String(minutes) + " นาที";

export function WorkOrderDetailPage() {
  const { id } = useParams();
  const { workOrders, changeStatus, saveRepairPhotos, isUpdating } =
    useWorkOrderActions();
  const incidents = useEntityQuery("incidents");
  const users = useEntityQuery("users");
  const slaRules = useEntityQuery("slaRules");
  const [showPhotos, setShowPhotos] = useState(false);
  const [repairFiles, setRepairFiles] = useState<File[]>([]);

  if (
    workOrders.isLoading ||
    incidents.isLoading ||
    users.isLoading ||
    slaRules.isLoading
  ) {
    return (
      <Box sx={{ minHeight: 320, display: "grid", placeItems: "center" }}>
        <Typography color="text.secondary">กำลังโหลดรายละเอียดงาน</Typography>
      </Box>
    );
  }

  const workOrder = (workOrders.data ?? []).find((item) => item.id === id);
  if (!workOrder)
    return <Alert severity="warning">ไม่พบใบสั่งงานที่ต้องการ</Alert>;
  const incident = (incidents.data ?? []).find(
    (item) => item.id === workOrder.incidentId,
  );
  if (!incident)
    return <Alert severity="warning">ไม่พบรายการแจ้งซ่อมของใบสั่งงานนี้</Alert>;

  const reporter = (users.data ?? []).find(
    (item) => item.id === incident.reporterId,
  );
  const technician = (users.data ?? []).find(
    (item) => item.id === workOrder.technicianId,
  );
  const slaRule = (slaRules.data ?? []).find(
    (item) => item.urgencyLevel === incident.urgencyReported,
  );
  const status = workOrderStatusDetail[workOrder.status];

  return (
    <Stack spacing={3}>
      <Box>
        <Button
          component={Link}
          to="/work-orders"
          startIcon={<ArrowBackOutlined />}
          sx={{ mb: 1 }}
        >
          กลับไปยังงานของฉัน
        </Button>
        <Typography variant="h3">รายละเอียดใบสั่งงาน</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          {workOrder.id} · {incident.ticketNumber}
        </Typography>
      </Box>

      <Box sx={{ position: "relative" }}>
        <PriorityRibbon urgency={incident.urgencyReported} />
        <DetailSection
          title="ภาพรวมงาน"
          icon={<BuildOutlined />}
          fields={[
            {
              label: "ประเภทปัญหา",
              value: <Typography>{incident.category}</Typography>,
            },
            {
              label: "สถานะงาน",
              value: <Typography>{status.label}</Typography>,
            },
            {
              label: "ใบสั่งงาน",
              value: (
                <Typography sx={{ fontWeight: 700 }}>{workOrder.id}</Typography>
              ),
            },
            {
              label: "สถานะแจ้งซ่อม",
              value: <IncidentStatusChip status={incident.status} />,
            },
          ]}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
          gap: 3,
        }}
      >
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
            {
              label: "ผู้รับผิดชอบ",
              value: (
                <Typography>{technician?.name ?? "ไม่พบข้อมูลช่าง"}</Typography>
              ),
              fullWidth: true,
            },
          ]}
        />
        <DetailSection
          title="เวลา SLA"
          icon={<ScheduleOutlined />}
          fields={[
            {
              label: "เวลาตอบรับที่กำหนด",
              value: (
                <Typography>
                  {slaRule ? formatMinutes(slaRule.responseMinutes) : "-"}
                </Typography>
              ),
            },
            {
              label: "เวลาแก้ไขที่กำหนด",
              value: (
                <Typography>
                  {slaRule ? formatMinutes(slaRule.resolveMinutes) : "-"}
                </Typography>
              ),
            },
            {
              label: "กำหนดตอบรับ",
              value: (
                <Typography>
                  {formatBangkokDate(workOrder.respondDueAt)} น.
                </Typography>
              ),
            },
            {
              label: "กำหนดแก้ไข",
              value: (
                <Typography>
                  {formatBangkokDate(workOrder.resolveDueAt)} น.
                </Typography>
              ),
            },
          ]}
        />
      </Box>

      <DetailSection title="ลำดับการดำเนินงาน" icon={<TimelineOutlined />}>
        <Stack spacing={1.5}>
          {workOrder.statusHistory.map((history) => (
            <Stack
              key={history.changedAt + history.status}
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 0.25, sm: 2 }}
              sx={{ pb: 1.5, borderBottom: 1, borderColor: "divider" }}
            >
              <Typography
                sx={{ minWidth: { sm: 170 } }}
                color="text.secondary"
                variant="body2"
              >
                {formatBangkokDate(history.changedAt)} น.
              </Typography>
              <Typography>
                {workOrderStatusDetail[history.status].label}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </DetailSection>

      <MainCard
        title={<Typography variant="h5">ดำเนินการกับงาน</Typography>}
        contentSx={{ p: { xs: 2.5, md: 3 } }}
      >
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            {workOrder.status === "pending" && (
              <SlaCountdown dueAt={workOrder.respondDueAt} label="ตอบรับ" />
            )}
            <SlaCountdown dueAt={workOrder.resolveDueAt} label="แก้ไข" />
          </Stack>
          <Divider />
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.25}
            sx={{ justifyContent: "flex-end" }}
          >
            <Button
              variant="outlined"
              startIcon={<PhotoCameraBackOutlined />}
              onClick={() => setShowPhotos((open) => !open)}
            >
              {showPhotos ? "ซ่อนช่องแนบรูป" : "แนบรูปหลังซ่อม"}
            </Button>
            {status.next && (
              <Button
                variant="contained"
                startIcon={<BuildOutlined />}
                disabled={isUpdating}
                onClick={() => changeStatus(workOrder.id, status.next!)}
              >
                {status.nextLabel}
              </Button>
            )}
          </Stack>
          <Collapse in={showPhotos}>
            <Box sx={{ pt: 1 }}>
              <ImageUploadField
                label="รูปหลังซ่อม"
                files={repairFiles}
                onChange={setRepairFiles}
              />
              <Stack
                direction="row"
                sx={{ justifyContent: "flex-end", mt: 1.5 }}
              >
                <Button
                  size="small"
                  disabled={!repairFiles.length || isUpdating}
                  onClick={async () => {
                    await saveRepairPhotos(workOrder.id, repairFiles);
                    setRepairFiles([]);
                    setShowPhotos(false);
                  }}
                >
                  บันทึกรูปหลังซ่อม
                </Button>
              </Stack>
            </Box>
          </Collapse>
        </Stack>
      </MainCard>
    </Stack>
  );
}
