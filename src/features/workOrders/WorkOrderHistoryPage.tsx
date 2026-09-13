import {
  AutorenewRounded,
  CancelOutlined,
  CheckCircleOutlineRounded,
  HistoryRounded,
  SearchRounded,
  VisibilityOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Chip,
  CircularProgress,
  InputAdornment,
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
  const summary = [
    {
      value: "all",
      label: "รายการทั้งหมด",
      count: rows.length,
      color: "#514091",
      background: "#F0ECFA",
      icon: <HistoryRounded />,
    },
    {
      value: "active",
      label: "กำลังดำเนินการ",
      count: rows.filter((row) => !["done", "rejected"].includes(row.status))
        .length,
      color: "#2F6F9F",
      background: "#EAF4FB",
      icon: <AutorenewRounded />,
    },
    {
      value: "done",
      label: "ปิดงานแล้ว",
      count: rows.filter((row) => row.status === "done").length,
      color: "#287357",
      background: "#EAF7F1",
      icon: <CheckCircleOutlineRounded />,
    },
    {
      value: "rejected",
      label: "ไม่รับรายการ",
      count: rows.filter((row) => row.status === "rejected").length,
      color: "#B0443E",
      background: "#FFF0EF",
      icon: <CancelOutlined />,
    },
  ];
  return (
    <Stack spacing={{ xs: 2, md: 2.5 }} sx={{ maxWidth: 1440, mx: "auto" }}>
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2.25, sm: 3 },
          overflow: "hidden",
          borderColor: "rgba(81,64,145,.16)",
          borderRadius: 2.5,
          background:
            "linear-gradient(120deg, rgba(81,64,145,.11), rgba(255,255,255,.98) 62%, rgba(231,242,251,.72))",
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: "center" }}
        >
          <Box
            sx={{
              width: { xs: 48, sm: 56 },
              height: { xs: 48, sm: 56 },
              flex: "0 0 auto",
              display: "grid",
              placeItems: "center",
              borderRadius: 2,
              color: "#FFFFFF",
              bgcolor: "#514091",
              boxShadow: "0 10px 22px rgba(81,64,145,.22)",
              "& .MuiSvgIcon-root": { fontSize: { xs: 26, sm: 30 } },
            }}
          >
            <HistoryRounded />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h3"
              sx={{ fontSize: { xs: "1.5rem", sm: "2rem" }, lineHeight: 1.25 }}
            >
              ประวัติการดำเนินงาน
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              {scope} ตั้งแต่รับแจ้งจนถึงสิ้นสุดการดำเนินงาน
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            md: "repeat(4, minmax(0, 1fr))",
          },
          gap: { xs: 1.25, md: 1.75 },
        }}
      >
        {summary.map((item) => {
          const selected = status === item.value;
          return (
            <ButtonBase
              key={item.value}
              onClick={() => updateFilter("status", item.value)}
              sx={{
                p: { xs: 1.5, sm: 2 },
                minHeight: { xs: 92, sm: 104 },
                display: "flex",
                justifyContent: "space-between",
                gap: 1,
                textAlign: "left",
                border: selected ? 2 : 1,
                borderColor: selected ? item.color : "#E2DCEB",
                borderRadius: 2.25,
                bgcolor: "background.paper",
                boxShadow: selected
                  ? `0 9px 24px ${item.color}1F`
                  : "0 5px 16px rgba(48,37,78,.04)",
                transition: "transform .15s ease, border-color .15s ease",
                "&:hover": { transform: "translateY(-2px)", borderColor: item.color },
              }}
            >
              <Box>
                <Typography
                  sx={{
                    color: item.color,
                    fontSize: { xs: "1.35rem", sm: "1.65rem" },
                    fontWeight: 700,
                    lineHeight: 1.1,
                  }}
                >
                  {item.count.toLocaleString("th-TH")}
                </Typography>
                <Typography sx={{ mt: 0.75, color: "#61586E", fontSize: ".78rem" }}>
                  {item.label}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: { xs: 34, sm: 40 },
                  height: { xs: 34, sm: 40 },
                  flex: "0 0 auto",
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 1.5,
                  color: item.color,
                  bgcolor: item.background,
                }}
              >
                {item.icon}
              </Box>
            </ButtonBase>
          );
        })}
      </Box>

      <Paper
        variant="outlined"
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderColor: "#E0D9EA",
          borderRadius: 2.25,
          boxShadow: "0 7px 20px rgba(48,37,78,.045)",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ alignItems: { sm: "center" } }}
        >
          <TextField
            placeholder="ค้นหาเลขที่ใบแจ้ง สถานที่ หรือรายละเอียด"
            aria-label="ค้นหาประวัติการดำเนินงาน"
            value={search}
            onChange={(event) => updateFilter("q", event.target.value)}
            size="small"
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded color="action" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            select
            label="สถานะปัจจุบัน"
            value={filters.some(([value]) => value === status) ? status : "all"}
            onChange={(event) => updateFilter("status", event.target.value)}
            size="small"
            sx={{ minWidth: { sm: 250 } }}
          >
            {filters.map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
        <Typography sx={{ mt: 1.25, color: "#746B80", fontSize: ".76rem" }}>
          พบ {filtered.length.toLocaleString("th-TH")} จาก {rows.length.toLocaleString("th-TH")} รายการ
        </Typography>
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
          <Stack spacing={1.25}>
            {filtered.slice((page - 1) * 10, page * 10).map((row) => (
              <Paper
                key={row.id}
                variant="outlined"
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  borderColor: "#E0D9EA",
                  borderRadius: 2.25,
                  boxShadow: "0 5px 18px rgba(48,37,78,.04)",
                  transition: "border-color .15s ease, box-shadow .15s ease",
                  "&:hover": {
                    borderColor: "#B9ABD3",
                    boxShadow: "0 9px 24px rgba(48,37,78,.075)",
                  },
                }}
              >
                <Stack spacing={1.75}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  sx={{
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ color: "#514091", fontSize: ".76rem", fontWeight: 700 }}>
                      {row.ticketNumber}
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 0.25 }}>
                      {row.category}
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
                    sx={{ fontWeight: 600 }}
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
                  sx={{
                    bgcolor: "#F7F5FA",
                    p: { xs: 1.5, sm: 1.75 },
                    borderRadius: 1.75,
                    borderLeft: "3px solid #7C67B3",
                  }}
                >
                  <Typography sx={{ color: "#413667", fontWeight: 700 }}>
                    {activityEventLabel(row.latestEvent)}
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
                    variant="contained"
                    startIcon={<VisibilityOutlined />}
                    sx={{ minWidth: { sm: 172 }, borderRadius: 1.75 }}
                  >
                    ดูรายละเอียด
                  </Button>
                </Box>
              </Stack>
              </Paper>
            ))}
          </Stack>
          {!filtered.length && (
            <Paper
              variant="outlined"
              sx={{
                minHeight: 260,
                p: { xs: 3, sm: 5 },
                display: "grid",
                placeItems: "center",
                textAlign: "center",
                borderColor: "#E0D9EA",
                borderRadius: 2.5,
              }}
            >
              <Box>
              <Box
                sx={{
                  width: 58,
                  height: 58,
                  mx: "auto",
                  display: "grid",
                  placeItems: "center",
                  color: "#8577A5",
                  bgcolor: "#F1EDF7",
                  borderRadius: "50%",
                }}
              >
                <HistoryRounded sx={{ fontSize: 30 }} />
              </Box>
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
              {rows.length > 0 && (
                <Button
                  variant="outlined"
                  sx={{ mt: 2, borderRadius: 1.75 }}
                  onClick={() => setParams({}, { replace: true })}
                >
                  ล้างตัวกรอง
                </Button>
              )}
              </Box>
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
