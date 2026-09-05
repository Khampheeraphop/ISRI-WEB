import {
  ArrowBackOutlined,
  AssignmentOutlined,
  BuildOutlined,
  HistoryOutlined,
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
import {
  Link,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { DetailSection } from "../../components/detail/DetailSection";
import { useAuth } from "../../hooks/useAuth";
import { formatBangkokDate } from "../../utils/incident";
import { WorkOrderHistoryTimeline } from "./WorkOrderHistoryTimeline";
import {
  getActivityDetail,
  historyStatusColor,
  historyStatusLabels,
} from "./activityHistoryApi";

export function ActivityHistoryDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "history" ? "history" : "details";
  const detail = useQuery({
    queryKey: ["activity-detail", user?.id, user?.role, id],
    queryFn: () => getActivityDetail(id ?? ""),
    enabled: Boolean(user && id),
  });
  if (detail.isLoading)
    return (
      <Box sx={{ minHeight: 300, display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  const back =
    typeof location.state?.historyBack === "string" &&
    location.state.historyBack.startsWith("/activity-history?")
      ? location.state.historyBack
      : "/activity-history";
  if (detail.isError || !detail.data)
    return (
      <Stack spacing={2}>
        <Button component={Link} to={back} startIcon={<ArrowBackOutlined />}>
          กลับไปประวัติการดำเนินงาน
        </Button>
        <Alert severity="error">
          ไม่พบรายการ หรือคุณไม่มีสิทธิ์เข้าถึงประวัตินี้
        </Alert>
      </Stack>
    );
  const { incident, events, workOrder } = detail.data;
  const latest = [...events].sort(
    (a, b) => Date.parse(b.changed_at) - Date.parse(a.changed_at),
  )[0];
  return (
    <Stack spacing={3}>
      <Box>
        <Button
          component={Link}
          to={back}
          startIcon={<ArrowBackOutlined />}
          sx={{ mb: 1 }}
        >
          กลับไปประวัติการดำเนินงาน
        </Button>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
        >
          <Box>
            <Typography
              variant="h3"
              sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}
            >
              รายละเอียดการดำเนินงาน
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              {incident.ticketNumber}
            </Typography>
          </Box>
          <Chip
            color={historyStatusColor(incident.status)}
            label={historyStatusLabels[incident.status] ?? incident.status}
          />
        </Stack>
      </Box>
      <Tabs
        value={tab}
        onChange={(_, value: string) =>
          setParams({ tab: value }, { replace: true })
        }
        variant="fullWidth"
        aria-label="รายละเอียดและประวัติการดำเนินงาน"
        sx={{
          maxWidth: 560,
          width: "100%",
          borderBottom: 1,
          borderColor: "divider",
          "& .MuiTab-root": {
            minWidth: 0,
            px: 1,
            fontSize: { xs: ".85rem", sm: ".95rem" },
          },
        }}
      >
        <Tab
          wrapped
          value="details"
          label="รายละเอียด"
          id="activity-tab-details"
          aria-controls="activity-panel-details"
        />
        <Tab
          wrapped
          value="history"
          label={`ประวัติการดำเนินงาน (${events.length})`}
          id="activity-tab-history"
          aria-controls="activity-panel-history"
        />
      </Tabs>
      <Box
        role="tabpanel"
        id="activity-panel-details"
        aria-labelledby="activity-tab-details"
        hidden={tab !== "details"}
      >
        <Stack spacing={3}>
          <DetailSection
            title="ข้อมูลรายการแจ้งซ่อม"
            icon={<AssignmentOutlined />}
            fields={[
              { label: "เลขที่ใบแจ้ง", value: incident.ticketNumber },
              { label: "ประเภทปัญหา", value: incident.category },
              { label: "สถานที่", value: incident.locationLabel },
              {
                label: "ชิ้นงาน / ครุภัณฑ์",
                value: incident.assetName || "ไม่ได้ระบุ",
              },
              {
                label: "วันที่แจ้ง",
                value: `${formatBangkokDate(incident.createdAt)} น.`,
              },
              {
                label: "สถานะปัจจุบัน",
                value: historyStatusLabels[incident.status] ?? incident.status,
              },
              {
                label: "รายละเอียดที่แจ้ง",
                fullWidth: true,
                value: (
                  <Typography
                    sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
                  >
                    {incident.description}
                  </Typography>
                ),
              },
            ]}
          />
          <DetailSection
            title="ผู้รับผิดชอบงานซ่อม"
            icon={<BuildOutlined />}
            fields={[
              {
                label: "ช่างหลัก",
                value: workOrder?.technician_name ?? "ยังไม่มอบหมายช่าง",
              },
              {
                label: "ช่างสนับสนุน",
                value:
                  workOrder?.support_technician_names.join(", ") || "ไม่มี",
              },
            ]}
          />
          <DetailSection title="การดำเนินงานล่าสุด" icon={<HistoryOutlined />}>
            {latest ? (
              <WorkOrderHistoryTimeline events={[latest]} />
            ) : (
              <Typography color="text.secondary">
                ยังไม่มีบันทึกการดำเนินงาน
              </Typography>
            )}
          </DetailSection>
        </Stack>
      </Box>
      <Box
        role="tabpanel"
        id="activity-panel-history"
        aria-labelledby="activity-tab-history"
        hidden={tab !== "history"}
      >
        <DetailSection
          title="ประวัติการดำเนินงานทั้งหมด"
          icon={<HistoryOutlined />}
        >
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            ลำดับเหตุการณ์ตั้งแต่รับแจ้ง · วันเวลาแสดงตามเวลาประเทศไทย
          </Typography>
          <WorkOrderHistoryTimeline events={events} />
        </DetailSection>
      </Box>
    </Stack>
  );
}
