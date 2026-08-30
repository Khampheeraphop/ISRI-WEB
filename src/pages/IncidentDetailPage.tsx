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
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { DetailSection } from "../components/detail/DetailSection";
import { IncidentStatusChip } from "../components/IncidentStatusChip";
import { PriorityRibbon } from "../components/PriorityRibbon";
import {
  getMyIncidentDetail,
  getMyIncidentHistory,
} from "../features/incidents/incidentsApi";
import { WorkOrderHistoryTimeline } from "../features/workOrders/WorkOrderHistoryTimeline";
import { workOrderStatusLabels } from "../features/workOrders/workOrderWorkflowUi";
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
  const [tab, setTab] = useState(0);
  const detail = useQuery({
    queryKey: ["incident", id],
    queryFn: () => getMyIncidentDetail(id ?? ""),
    enabled: Boolean(id),
  });
  const history = useQuery({
    queryKey: ["incident-history", id],
    queryFn: () => getMyIncidentHistory(id ?? ""),
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
  const workOrder = history.data?.workOrder;

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
      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        aria-label="รายละเอียดรายการแจ้งซ่อม"
      >
        <Tab label="รายละเอียด" />
        <Tab
          label={`ประวัติการดำเนินงาน (${history.data?.events.length ?? 0})`}
        />
      </Tabs>
      {tab === 0 && (
        <>
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
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
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
          {incident.status === "rejected" && (
            <DetailSection
              title="ผลการพิจารณา"
              icon={<TimelineOutlined />}
              fields={[
                {
                  label: "ผลการพิจารณา",
                  value: <IncidentStatusChip status={incident.status} />,
                },
                {
                  label: "เหตุผล",
                  value: (
                    <Typography sx={{ whiteSpace: "pre-wrap" }}>
                      {incident.rejectionReason ?? "ไม่ได้ระบุเหตุผล"}
                    </Typography>
                  ),
                  fullWidth: true,
                },
                {
                  label: "พิจารณาเมื่อ",
                  value: (
                    <Typography>
                      {incident.rejectedAt
                        ? `${formatBangkokDate(incident.rejectedAt)} น.`
                        : "ไม่ได้ระบุ"}
                    </Typography>
                  ),
                },
              ]}
            />
          )}
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
              gridTemplateColumns: {
                xs: "1fr",
                lg: "repeat(2, minmax(0, 1fr))",
              },
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
                {
                  label: "ใบสั่งงาน",
                  value: history.isLoading ? (
                    <Typography color="text.secondary">
                      กำลังโหลดข้อมูล
                    </Typography>
                  ) : workOrder ? (
                    <Typography sx={{ fontWeight: 600 }}>
                      สร้างใบสั่งงานแล้ว
                    </Typography>
                  ) : (
                    <Typography>รอผู้ประสานงานจัดสรรงาน</Typography>
                  ),
                },
                {
                  label: "สถานะงานซ่อม",
                  value: history.isLoading ? (
                    <Typography color="text.secondary">
                      กำลังโหลดข้อมูล
                    </Typography>
                  ) : workOrder ? (
                    <Typography>
                      {workOrderStatusLabels[workOrder.status] ??
                        workOrder.status}
                    </Typography>
                  ) : (
                    <Typography>ยังไม่มีการมอบหมายงาน</Typography>
                  ),
                },
                {
                  label: "ช่างผู้รับผิดชอบ",
                  value: workOrder ? (
                    <Stack spacing={0.25}>
                      <Typography>
                        ช่างหลัก: {workOrder.technician_name ?? "ไม่ระบุ"}
                      </Typography>
                      {workOrder.support_technician_names?.length ? (
                        <Typography variant="body2" color="text.secondary">
                          ช่างสนับสนุน:{" "}
                          {workOrder.support_technician_names.join(", ")}
                        </Typography>
                      ) : null}
                    </Stack>
                  ) : (
                    <Typography color="text.secondary">ยังไม่ระบุ</Typography>
                  ),
                },
                {
                  label: "มอบหมายเมื่อ",
                  value: workOrder?.assigned_at ? (
                    <Typography>
                      {formatBangkokDate(workOrder.assigned_at)} น.
                    </Typography>
                  ) : (
                    <Typography color="text.secondary">
                      ยังไม่มีการมอบหมายงาน
                    </Typography>
                  ),
                },
              ]}
            />
          </Box>
        </>
      )}
      {tab === 1 && (
        <DetailSection title="ประวัติการดำเนินงาน" icon={<TimelineOutlined />}>
          {history.isLoading ? (
            <Box sx={{ minHeight: 160, display: "grid", placeItems: "center" }}>
              <CircularProgress size={28} />
            </Box>
          ) : history.error ? (
            <Alert severity="error">
              {history.error instanceof Error
                ? history.error.message
                : "ไม่สามารถโหลดประวัติได้"}
            </Alert>
          ) : (
            <WorkOrderHistoryTimeline events={history.data?.events ?? []} />
          )}
        </DetailSection>
      )}
    </Stack>
  );
}
