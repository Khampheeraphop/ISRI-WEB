import { HistoryOutlined, VisibilityOutlined } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { formatBangkokDate } from "../../utils/incident";
import {
  activityEventLabel,
  getActivityHistory,
  historyStatusColor,
  historyStatusLabels,
} from "./activityHistoryApi";

const filters = [
  ["all", "ทุกสถานะ"],
  ["active", "กำลังดำเนินการทั้งหมด"],
  ["pending_assignment", "รอจัดสรรงาน"],
  ["pending", "รอช่างรับงาน"],
  ["in_progress", "กำลังดำเนินการซ่อม"],
  ["pending_parts_approval", "รออนุมัติเบิกอะไหล่"],
  ["waiting_parts", "รอรับอะไหล่"],
  ["pending_repair_approval", "รอตรวจรับงานซ่อม"],
  ["done", "ปิดงาน"],
  ["rejected", "ไม่รับรายการ"],
];
export function WorkOrderHistoryPage() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const search = params.get("q") ?? "";
  const requestedStatus = params.get("status") ?? "all";
  const status = filters.some(([value]) => value === requestedStatus) ? requestedStatus : "all";
  const history = useQuery({
    queryKey: ["activity-history", user?.id, user?.role],
    queryFn: getActivityHistory,
    enabled: Boolean(user),
  });
  const updateFilter = (key: string, value: string) =>
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.set(key, value);
        next.delete("page");
        return next;
      },
      { replace: true },
    );
  if (history.isLoading)
    return (
      <Box sx={{ minHeight: 280, display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  const rows = history.data ?? [];
  const filtered = rows.filter((row) => {
    const current =
      row.status === "assigned"
        ? "pending"
        : row.status === "submitted"
          ? "pending_assignment"
          : row.status;
    return (
      (status === "all" ||
        (status === "active"
          ? !["done", "rejected"].includes(current)
          : status === current)) &&
      `${row.ticketNumber} ${row.category} ${row.locationLabel} ${row.assetName ?? ""} ${row.description}`
        .toLocaleLowerCase("th")
        .includes(search.trim().toLocaleLowerCase("th"))
    );
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / 10));
  const page = Math.min(
    pageCount,
    Math.max(1, Math.floor(Number(params.get("page"))) || 1),
  );
  const scope =
    user?.role === "admin"
      ? "ติดตามรายการแจ้งซ่อมทั้งหมดของระบบ"
      : user?.role === "reporter"
        ? "ติดตามรายการที่คุณแจ้งและการดำเนินงานของทีมซ่อม"
        : "ติดตามงานที่คุณได้รับมอบหมายหรือเคยดำเนินการ";
  return (
    <Stack spacing={3}>
      <Box>
        <Typography
          variant="h3"
          sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}
        >
          ประวัติการดำเนินงาน
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          {scope} ตั้งแต่รับแจ้งจนถึงปิดงานหรือไม่รับรายการ
        </Typography>
      </Box>
      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
        <Chip label={`ทั้งหมด ${rows.length} รายการ`} variant="outlined" />
        <Chip
          label={`กำลังดำเนินการ ${rows.filter((row) => !["done", "rejected"].includes(row.status)).length}`}
          color="primary"
          variant="outlined"
        />
        <Chip
          label={`ปิดงาน ${rows.filter((row) => row.status === "done").length}`}
          color="success"
          variant="outlined"
        />
        <Chip
          label={`ไม่รับรายการ ${rows.filter((row) => row.status === "rejected").length}`}
          color="error"
          variant="outlined"
        />
      </Stack>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="ค้นหาเลขที่ใบแจ้ง สถานที่ หรือรายละเอียด"
            value={search}
            onChange={(event) => updateFilter("q", event.target.value)}
            size="small"
            fullWidth
          />
          <TextField
            select
            label="สถานะปัจจุบัน"
            value={filters.some(([value]) => value === status) ? status : "all"}
            onChange={(event) => updateFilter("status", event.target.value)}
            size="small"
            sx={{ minWidth: { sm: 240 } }}
          >
            {filters.map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>
      {history.isError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={() => history.refetch()}>
              ลองใหม่
            </Button>
          }
        >
          ไม่สามารถโหลดประวัติการดำเนินงานได้
        </Alert>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary">
            พบ {filtered.length} รายการ · เรียงตามการดำเนินงานล่าสุด
          </Typography>
          {filtered.slice((page - 1) * 10, page * 10).map((row) => (
            <Paper
              key={row.id}
              variant="outlined"
              sx={{ p: { xs: 2, sm: 2.5 } }}
            >
              <Stack spacing={1.5}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  sx={{
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h6">
                      {row.ticketNumber} · {row.category}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      sx={{ overflowWrap: "anywhere" }}
                    >
                      {row.locationLabel}
                      {row.assetName ? ` · ${row.assetName}` : ""}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    color={historyStatusColor(row.status)}
                    label={historyStatusLabels[row.status] ?? row.status}
                  />
                </Stack>
                <Typography
                  sx={{
                    whiteSpace: "pre-wrap",
                    overflowWrap: "anywhere",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {row.description}
                </Typography>
                <Box
                  sx={{ bgcolor: "action.hover", p: 1.5, borderRadius: 1.5 }}
                >
                  <Typography sx={{ fontWeight: 600 }}>
                    การดำเนินงานล่าสุด: {activityEventLabel(row.latestEvent)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {row.latestEvent.changed_by_name} ·{" "}
                    {formatBangkokDate(row.latestEvent.changed_at)} น.
                  </Typography>
                  {row.latestEvent.note && (
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 0.5,
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {row.latestEvent.note}
                    </Typography>
                  )}
                </Box>
                {row.myLatestEvent && (
                  <Typography variant="body2" color="text.secondary">
                    การดำเนินงานล่าสุดของคุณ:{" "}
                    {activityEventLabel(row.myLatestEvent)} ·{" "}
                    {formatBangkokDate(row.myLatestEvent.changed_at)} น.
                  </Typography>
                )}
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    component={Link}
                    to={`/activity-history/${row.id}`}
                    state={{
                      historyBack: `/activity-history?${params.toString()}`,
                    }}
                    variant="outlined"
                    startIcon={<VisibilityOutlined />}
                  >
                    รายละเอียด / ประวัติ
                  </Button>
                </Box>
              </Stack>
            </Paper>
          ))}
          {!filtered.length && (
            <Paper sx={{ p: { xs: 3, sm: 5 }, textAlign: "center" }}>
              <HistoryOutlined color="disabled" sx={{ fontSize: 34 }} />
              <Typography variant="h6" sx={{ mt: 1 }}>
                {rows.length
                  ? "ไม่พบรายการที่ตรงกับตัวกรอง"
                  : "ยังไม่มีประวัติการดำเนินงาน"}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                {rows.length
                  ? "ลองเปลี่ยนสถานะหรือคำค้นหา"
                  : "รายการที่คุณเกี่ยวข้องจะแสดงที่นี่ รวมถึงงานที่ยังไม่ปิด"}
              </Typography>
            </Paper>
          )}
          {pageCount > 1 && (
            <Pagination
              count={pageCount}
              page={page}
              size="small"
              siblingCount={0}
              onChange={(_, value) =>
                setParams((previous) => {
                  const next = new URLSearchParams(previous);
                  next.set("page", String(value));
                  return next;
                })
              }
              sx={{ alignSelf: "center" }}
            />
          )}
        </>
      )}
    </Stack>
  );
}
