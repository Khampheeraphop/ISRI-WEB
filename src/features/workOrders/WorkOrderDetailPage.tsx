import {
  ArrowBackOutlined,
  BuildOutlined,
  DescriptionOutlined,
  LocationOnOutlined,
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { DetailSection } from "../../components/detail/DetailSection";
import { useAuth } from "../../hooks/useAuth";
import { formatBangkokDate } from "../../utils/incident";
import { WorkOrderActionDialog } from "./WorkOrderActionDialog";
import { WorkOrderHistoryTimeline } from "./WorkOrderHistoryTimeline";
import {
  getIncident,
  getWorkOrderDetail,
  performWorkOrderAction,
  uploadWorkOrderAttachments,
} from "./workOrdersApi";
import {
  actionTitles,
  technicianPrimaryAction,
  workOrderStatusLabels,
} from "./workOrderWorkflowUi";

export function WorkOrderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const client = useQueryClient();
  const [tab, setTab] = useState(0);
  const [actionName, setActionName] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string>();
  const detail = useQuery({
    queryKey: ["work-order", id],
    queryFn: () => getWorkOrderDetail(id ?? ""),
    enabled: Boolean(id),
  });
  const action = useMutation({
    mutationFn: async ({
      name,
      note,
      files,
    }: {
      name: string;
      note: string;
      files: File[];
    }) =>
      performWorkOrderAction({
        id: id ?? "",
        action: name,
        note,
        attachments: await uploadWorkOrderAttachments(files),
      }),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ["work-order", id] }),
        client.invalidateQueries({ queryKey: ["my-work-orders"] }),
      ]);
      setActionName(null);
    },
    onError: (cause) =>
      setActionError(
        cause instanceof Error
          ? cause.message
          : "ไม่สามารถบันทึกการดำเนินงานได้",
      ),
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
          : "ไม่พบใบสั่งงาน"}
      </Alert>
    );
  const { workOrder, events } = detail.data;
  const incident = getIncident(workOrder);
  if (!incident)
    return <Alert severity="error">ไม่พบข้อมูลรายการแจ้งซ่อม</Alert>;
  const readOnly = location.pathname.includes("/history/");
  const backTo = readOnly
    ? user?.role === "dispatcher"
      ? "/dispatch/history"
      : "/work-orders/history"
    : user?.role === "dispatcher"
      ? "/dispatch"
      : "/work-orders";
  const primary =
    !readOnly && user?.role === "technician"
      ? technicianPrimaryAction[workOrder.status]
      : undefined;
  return (
    <Stack spacing={3}>
      <Box>
        <Button
          component={Link}
          to={backTo}
          startIcon={<ArrowBackOutlined />}
          sx={{ mb: 1 }}
        >
          กลับไปงานของฉัน
        </Button>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
        >
          <Box>
            <Typography variant="h3">รายละเอียดงานซ่อม</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              {incident.ticket_number}
            </Typography>
          </Box>
          <Chip
            color={workOrder.status === "done" ? "success" : "primary"}
            label={workOrderStatusLabels[workOrder.status] ?? workOrder.status}
          />
        </Stack>
      </Box>
      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        aria-label="รายละเอียดงาน"
      >
        <Tab label="รายละเอียด" />
        <Tab label={`ประวัติการดำเนินงาน (${events.length})`} />
      </Tabs>
      {tab === 0 && (
        <Stack spacing={3}>
          <DetailSection
            title="ข้อมูลงานซ่อม"
            icon={<DescriptionOutlined />}
            fields={[
              {
                label: "เลขที่ใบแจ้ง",
                value: (
                  <Typography sx={{ fontWeight: 700 }}>
                    {incident.ticket_number}
                  </Typography>
                ),
              },
              {
                label: "สถานะ",
                value: (
                  <Typography>
                    {workOrderStatusLabels[workOrder.status] ??
                      workOrder.status}
                  </Typography>
                ),
              },
              {
                label: "ประเภทปัญหา",
                value: <Typography>{incident.category}</Typography>,
              },
              {
                label: "รายละเอียดที่แจ้ง",
                value: (
                  <Typography sx={{ whiteSpace: "pre-wrap" }}>
                    {incident.description}
                  </Typography>
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
                value: <Typography>{incident.location_label}</Typography>,
              },
              {
                label: "ชื่อชิ้นงาน",
                value: (
                  <Typography>{incident.asset_name || "ไม่ได้ระบุ"}</Typography>
                ),
              },
            ]}
          />
          <DetailSection
            title="กำหนดเวลา SLA"
            icon={<TimelineOutlined />}
            fields={[
              {
                label: "รับงานภายใน",
                value: (
                  <Typography>
                    {formatBangkokDate(workOrder.respond_due_at)} น.
                  </Typography>
                ),
              },
              {
                label: "แก้ไขให้แล้วเสร็จ",
                value: (
                  <Typography>
                    {formatBangkokDate(workOrder.resolve_due_at)} น.
                  </Typography>
                ),
              },
            ]}
          />
          <DetailSection
            title="ทีมช่างที่ได้รับมอบหมาย"
            icon={<BuildOutlined />}
            fields={[
              {
                label: "ช่างหลัก",
                value: (
                  <Typography>
                    {workOrder.assignees?.find(
                      (assignee) => assignee.assignment_role === "primary",
                    )?.full_name ?? "ไม่ระบุ"}
                  </Typography>
                ),
              },
              {
                label: "ช่างสนับสนุน",
                value: (
                  <Typography>
                    {workOrder.assignees
                      ?.filter(
                        (assignee) => assignee.assignment_role === "support",
                      )
                      .map((assignee) => assignee.full_name)
                      .join(", ") || "ไม่มี"}
                  </Typography>
                ),
              },
            ]}
          />
          {!readOnly && (primary || workOrder.status === "in_progress") ? (
            <Box
              sx={{
                border: 1,
                borderColor: "primary.light",
                borderRadius: 2,
                bgcolor: "action.hover",
                px: { xs: 2, sm: 2.5 },
                py: 2,
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{
                  alignItems: { sm: "center" },
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>ขั้นตอนถัดไป</Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.25 }}
                  >
                    บันทึกข้อมูลการดำเนินงานในใบงานนี้
                    ระบบจะแจ้งสถานะให้ผู้เกี่ยวข้องทราบ
                  </Typography>
                </Box>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  {workOrder.status === "in_progress" && (
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setActionError(undefined);
                        setActionName("request_parts");
                      }}
                    >
                      เบิกอะไหล่
                    </Button>
                  )}
                  {primary && (
                    <Button
                      variant="contained"
                      startIcon={<BuildOutlined />}
                      onClick={() => {
                        setActionError(undefined);
                        setActionName(primary.action);
                      }}
                    >
                      {primary.label}
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Box>
          ) : null}
        </Stack>
      )}
      {tab === 1 && (
        <DetailSection title="ประวัติการดำเนินงาน" icon={<TimelineOutlined />}>
          <WorkOrderHistoryTimeline events={events} />
        </DetailSection>
      )}
      <WorkOrderActionDialog
        open={Boolean(actionName)}
        action={actionName}
        title={actionName ? actionTitles[actionName] : ""}
        busy={action.isPending}
        error={actionError}
        onClose={() => setActionName(null)}
        onSubmit={(note, files) =>
          actionName && action.mutate({ name: actionName, note, files })
        }
      />
    </Stack>
  );
}
