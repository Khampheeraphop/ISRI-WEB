import {
  CancelOutlined,
  CardGiftcardRounded,
  CheckCircleOutlineRounded,
  HourglassTopRounded,
  Inventory2Outlined,
  LocalShippingOutlined,
  SearchRounded,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Typography,
  TextField,
} from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, type ReactNode } from "react";
import { GenericDataTable } from "../../components/GenericDataTable";
import { MainCard } from "../../components/base/MainCard";
import { ActionDialog } from "../../components/feedback/ActionDialog";
import { tableColumnAlignment } from "../../components/dataTable.constants";
import { formatThaiPhoneNumber } from "../../utils/phone";
import {
  getAdminRewardRedemptions,
  updateAdminRewardRedemption,
  type AdminRewardRedemption,
} from "./rewardsApi";

const statusLabels = {
  pending: "รออนุมัติ",
  approved: "อนุมัติ รอส่งมอบ",
  fulfilled: "ส่งมอบแล้ว",
  cancelled: "ยกเลิก",
};

type RedemptionStatus = "all" | keyof typeof statusLabels;

function SummaryCard({
  label,
  value,
  color,
  background,
  icon,
  selected,
  onClick,
}: {
  label: string;
  value: number;
  color: string;
  background: string;
  icon: ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <Card
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        minHeight: { xs: 92, sm: 104 },
        p: { xs: 1.5, sm: 2 },
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        textAlign: "left",
        font: "inherit",
        cursor: "pointer",
        border: selected ? 2 : 1,
        borderColor: selected ? color : "#E2DCEB",
        borderRadius: 2.25,
        bgcolor: "background.paper",
        boxShadow: selected
          ? `0 9px 24px ${color}1F`
          : "0 5px 16px rgba(48,37,78,.04)",
        transition: "transform .15s ease, border-color .15s ease",
        "&:hover": { transform: "translateY(-2px)", borderColor: color },
      }}
    >
      <Box>
        <Typography
          sx={{
            color,
            fontSize: { xs: "1.35rem", sm: "1.65rem" },
            fontWeight: 700,
            lineHeight: 1.1,
          }}
        >
          {value.toLocaleString("th-TH")}
        </Typography>
        <Typography sx={{ mt: 0.75, color: "#61586E", fontSize: ".78rem" }}>
          {label}
        </Typography>
      </Box>
      <Box
        sx={{
          width: { xs: 34, sm: 40 },
          height: { xs: 34, sm: 40 },
          flex: "0 0 auto",
          display: "grid",
          placeItems: "center",
          color,
          bgcolor: background,
          borderRadius: 1.5,
        }}
      >
        {icon}
      </Box>
    </Card>
  );
}

export function RewardRedemptionAdminPage() {
  const client = useQueryClient();
  const [error, setError] = useState<string>();
  const [action, setAction] = useState<{
    row: AdminRewardRedemption;
    status: "approved" | "fulfilled" | "cancelled";
  }>();
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RedemptionStatus>("all");
  const items = useQuery({
    queryKey: ["admin-reward-redemptions"],
    queryFn: getAdminRewardRedemptions,
  });
  const update = useMutation({
    mutationFn: updateAdminRewardRedemption,
    onSuccess: async () => {
      setError(undefined);
      setAction(undefined);
      setNote("");
      await Promise.all([
        client.invalidateQueries({ queryKey: ["admin-reward-redemptions"] }),
        client.invalidateQueries({ queryKey: ["admin-rewards"] }),
        client.invalidateQueries({ queryKey: ["reward-wallet"] }),
        client.invalidateQueries({ queryKey: ["reward-catalog"] }),
      ]);
    },
    onError: (cause) =>
      setError(cause instanceof Error ? cause.message : "บันทึกสถานะไม่สำเร็จ"),
  });
  const rows = items.data ?? [];
  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("th-TH");
    return rows.filter((row) => {
      const matchesStatus =
        statusFilter === "all" || row.status === statusFilter;
      const matchesSearch =
        !keyword ||
        `${row.reward_items?.name ?? ""} ${row.recipient_name} ${row.phone} ${row.delivery_address ?? ""}`
          .toLocaleLowerCase("th-TH")
          .includes(keyword);
      return matchesStatus && matchesSearch;
    });
  }, [rows, search, statusFilter]);
  const columns: GridColDef<AdminRewardRedemption>[] = [
    {
      field: "reward",
      headerName: "รางวัล",
      minWidth: 210,
      flex: 1,
      renderCell: ({ row }) => (
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700 }} noWrap>
            {row.reward_items?.name ?? "ไม่ระบุรางวัล"}
          </Typography>
          <Typography color="primary" sx={{ mt: 0.25, fontSize: ".72rem", fontWeight: 600 }}>
            ใช้ {row.point_cost.toLocaleString("th-TH")} คะแนน
          </Typography>
        </Box>
      ),
    },
    {
      field: "recipient_name",
      headerName: "ผู้รับ",
      minWidth: 220,
      flex: 1,
      renderCell: ({ row }) => (
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600 }} noWrap>
            {row.recipient_name}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.25, fontSize: ".74rem" }}>
            {formatThaiPhoneNumber(row.phone)}
          </Typography>
        </Box>
      ),
    },
    {
      field: "fulfillment",
      headerName: "วิธีรับและสถานที่",
      minWidth: 270,
      flex: 1.25,
      renderCell: ({ row }) => (
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600 }}>
            {row.fulfillment_method === "delivery" ? "จัดส่ง" : "รับด้วยตนเอง"}
          </Typography>
          <Typography
            title={row.delivery_address ?? undefined}
            color="text.secondary"
            sx={{ mt: 0.25, fontSize: ".72rem" }}
            noWrap
          >
            {row.delivery_address ?? "รับ ณ จุดรับรางวัล"}
          </Typography>
        </Box>
      ),
    },
    {
      field: "status",
      headerName: "สถานะ",
      width: 170,
      ...tableColumnAlignment.center,
      renderCell: ({ row }) => (
        <Box
          sx={{
            display: "flex",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Chip
            size="small"
            label={statusLabels[row.status]}
            color={
              row.status === "fulfilled"
                ? "success"
                : row.status === "cancelled"
                  ? "default"
                  : "warning"
            }
            variant="outlined"
          />
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "จัดการ",
      width: 220,
      ...tableColumnAlignment.actions,
      renderCell: ({ row }) =>
        row.status === "pending" || row.status === "approved" ? (
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Button
              size="small"
              variant="contained"
              disabled={update.isPending}
              onClick={() => {
                setError(undefined);
                setAction({
                  row,
                  status: row.status === "pending" ? "approved" : "fulfilled",
                });
              }}
            >
              {row.status === "pending" ? "อนุมัติ" : "บันทึกส่งมอบ"}
            </Button>
            <Button
              size="small"
              color="error"
              disabled={update.isPending}
              onClick={() => {
                setError(undefined);
                setAction({ row, status: "cancelled" });
              }}
            >
              ยกเลิก
            </Button>
          </Stack>
        ) : (
          <Box
            sx={{
              display: "flex",
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              –
            </Typography>
          </Box>
        ),
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
            "linear-gradient(120deg, rgba(81,64,145,.11), rgba(255,255,255,.98) 62%, rgba(244,236,252,.78))",
        }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
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
            <CardGiftcardRounded />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h3"
              sx={{ fontSize: { xs: "1.5rem", sm: "2rem" }, lineHeight: 1.25 }}
            >
              อนุมัติและส่งมอบรางวัล
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              ตรวจสอบคำขอ อนุมัติ และติดตามการส่งมอบรางวัลในที่เดียว
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
        <SummaryCard
          label="คำขอทั้งหมด"
          value={rows.length}
          color="#514091"
          background="#F0ECFA"
          icon={<Inventory2Outlined />}
          selected={statusFilter === "all"}
          onClick={() => setStatusFilter("all")}
        />
        <SummaryCard
          label="รออนุมัติ"
          value={rows.filter((row) => row.status === "pending").length}
          color="#A56312"
          background="#FFF5E7"
          icon={<HourglassTopRounded />}
          selected={statusFilter === "pending"}
          onClick={() => setStatusFilter("pending")}
        />
        <SummaryCard
          label="รอส่งมอบ"
          value={rows.filter((row) => row.status === "approved").length}
          color="#2F6F9F"
          background="#EAF4FB"
          icon={<LocalShippingOutlined />}
          selected={statusFilter === "approved"}
          onClick={() => setStatusFilter("approved")}
        />
        <SummaryCard
          label="ส่งมอบแล้ว"
          value={rows.filter((row) => row.status === "fulfilled").length}
          color="#287357"
          background="#EAF7F1"
          icon={<CheckCircleOutlineRounded />}
          selected={statusFilter === "fulfilled"}
          onClick={() => setStatusFilter("fulfilled")}
        />
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
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ค้นหารางวัล ผู้รับ เบอร์โทร หรือที่อยู่"
            aria-label="ค้นหาคำขอรับรางวัล"
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
            label="สถานะ"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as RedemptionStatus)
            }
            size="small"
            sx={{ minWidth: { sm: 220 } }}
          >
            <MenuItem value="all">ทุกสถานะ</MenuItem>
            {Object.entries(statusLabels).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
        <Typography sx={{ mt: 1.25, color: "#746B80", fontSize: ".76rem" }}>
          แสดง {filteredRows.length.toLocaleString("th-TH")} จาก {rows.length.toLocaleString("th-TH")} คำขอ
        </Typography>
      </Paper>

      {(items.error || error) && (
        <Alert severity="error">
          {error ||
            (items.error instanceof Error
              ? items.error.message
              : "โหลดรายการไม่สำเร็จ")}
        </Alert>
      )}
      <MainCard sx={{ display: { xs: "none", md: "block" }, borderRadius: 2.5 }}>
        <GenericDataTable
          rows={filteredRows}
          columns={columns}
          loading={items.isLoading}
          rowHeight={72}
          disableColumnMenu
          emptyMessage={
            search || statusFilter !== "all"
              ? "ไม่พบคำขอที่ตรงกับตัวกรอง"
              : "ยังไม่มีคำขอรับรางวัล"
          }
        />
      </MainCard>

      <Stack spacing={1.25} sx={{ display: { xs: "flex", md: "none" } }}>
        {filteredRows.map((row) => (
          <Paper
            key={row.id}
            variant="outlined"
            sx={{ p: 2, borderColor: "#E0D9EA", borderRadius: 2.25 }}
          >
            <Stack spacing={1.5}>
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700 }}>
                    {row.reward_items?.name ?? "ไม่ระบุรางวัล"}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.25, fontSize: ".8rem" }}>
                    ผู้รับ: {row.recipient_name} · {formatThaiPhoneNumber(row.phone)}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label={statusLabels[row.status]}
                  color={
                    row.status === "fulfilled"
                      ? "success"
                      : row.status === "cancelled"
                        ? "default"
                        : "warning"
                  }
                  variant="outlined"
                />
              </Stack>
              <Box sx={{ p: 1.25, borderRadius: 1.5, bgcolor: "#F7F5FA" }}>
                <Typography sx={{ fontSize: ".8rem" }}>
                  วิธีรับ: {row.fulfillment_method === "delivery" ? "จัดส่ง" : "รับด้วยตนเอง"}
                </Typography>
                {row.delivery_address && (
                  <Typography color="text.secondary" sx={{ mt: 0.35, fontSize: ".76rem" }}>
                    {row.delivery_address}
                  </Typography>
                )}
                <Typography color="primary" sx={{ mt: 0.5, fontSize: ".78rem", fontWeight: 700 }}>
                  ใช้ {row.point_cost.toLocaleString("th-TH")} คะแนน
                </Typography>
              </Box>
              {(row.status === "pending" || row.status === "approved") && (
                <Stack direction="row" spacing={1}>
                  <Button
                    fullWidth
                    variant="contained"
                    disabled={update.isPending}
                    onClick={() => {
                      setError(undefined);
                      setAction({
                        row,
                        status: row.status === "pending" ? "approved" : "fulfilled",
                      });
                    }}
                  >
                    {row.status === "pending" ? "อนุมัติ" : "บันทึกส่งมอบ"}
                  </Button>
                  <Button
                    color="error"
                    startIcon={<CancelOutlined />}
                    disabled={update.isPending}
                    onClick={() => {
                      setError(undefined);
                      setAction({ row, status: "cancelled" });
                    }}
                  >
                    ยกเลิก
                  </Button>
                </Stack>
              )}
            </Stack>
          </Paper>
        ))}
        {!items.isLoading && !filteredRows.length && (
          <Paper
            variant="outlined"
            sx={{ py: 6, textAlign: "center", borderColor: "#E0D9EA", borderRadius: 2.25 }}
          >
            <CardGiftcardRounded sx={{ fontSize: 40, color: "#9B90AE" }} />
            <Typography sx={{ mt: 1, fontWeight: 700 }}>
              {rows.length ? "ไม่พบคำขอที่ตรงกับตัวกรอง" : "ยังไม่มีคำขอรับรางวัล"}
            </Typography>
          </Paper>
        )}
      </Stack>
      <ActionDialog
        open={Boolean(action)}
        maxWidth="sm"
        title={
          action?.status === "approved"
            ? "ยืนยันการอนุมัติคำขอ"
            : action?.status === "fulfilled"
              ? "ยืนยันการส่งมอบรางวัล"
              : action?.status === "cancelled"
                ? "ยืนยันการยกเลิกคำขอ"
                : "จัดการคำขอ"
        }
        icon={
          action?.status === "approved" ? (
            <CheckCircleOutlineRounded color="primary" />
          ) : action?.status === "fulfilled" ? (
            <LocalShippingOutlined color="success" />
          ) : (
            <CancelOutlined color="error" />
          )
        }
        onRequestClose={
          update.isPending
            ? undefined
            : () => {
                setAction(undefined);
                setNote("");
              }
        }
        footer={
          <>
            <Button
              color="inherit"
              disabled={update.isPending}
              onClick={() => {
                setAction(undefined);
                setNote("");
              }}
            >
              กลับ
            </Button>
            <Button
              variant="contained"
              color={action?.status === "cancelled" ? "error" : "primary"}
              startIcon={
                action?.status === "cancelled" ? (
                  <CancelOutlined />
                ) : action?.status === "fulfilled" ? (
                  <LocalShippingOutlined />
                ) : (
                  <CheckCircleOutlineRounded />
                )
              }
              disabled={
                update.isPending ||
                (action?.status === "cancelled" && !note.trim())
              }
              onClick={() =>
                action &&
                update.mutate({ id: action.row.id, status: action.status, note })
              }
            >
              {update.isPending
                ? "กำลังบันทึก..."
                : action?.status === "approved"
                  ? "อนุมัติคำขอ"
                  : action?.status === "fulfilled"
                    ? "ยืนยันส่งมอบ"
                    : "ยกเลิกคำขอ"}
            </Button>
          </>
        }
      >
        <Stack spacing={2}>
          {action && (
            <Box
              sx={{
                p: 1.75,
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                gap: 1.5,
                border: "1px solid #DED6EA",
                borderRadius: 2,
                bgcolor: "#F8F6FB",
              }}
            >
              <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
                <Typography color="text.secondary" sx={{ fontSize: ".72rem" }}>
                  รางวัล
                </Typography>
                <Typography sx={{ mt: 0.25, fontWeight: 700 }}>
                  {action.row.reward_items?.name ?? "ไม่ระบุรางวัล"}
                </Typography>
                <Chip
                  size="small"
                  color="primary"
                  label={`${action.row.point_cost.toLocaleString("th-TH")} คะแนน`}
                  sx={{ mt: 0.75, fontWeight: 700 }}
                />
              </Box>
              <Box>
                <Typography color="text.secondary" sx={{ fontSize: ".72rem" }}>
                  ผู้รับและเบอร์โทร
                </Typography>
                <Typography sx={{ mt: 0.25, fontWeight: 600 }}>
                  {action.row.recipient_name}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.15, fontSize: ".8rem" }}>
                  {formatThaiPhoneNumber(action.row.phone)}
                </Typography>
              </Box>
              <Box>
                <Typography color="text.secondary" sx={{ fontSize: ".72rem" }}>
                  วิธีรับรางวัล
                </Typography>
                <Typography sx={{ mt: 0.25, fontWeight: 600 }}>
                  {action.row.fulfillment_method === "delivery"
                    ? "จัดส่ง"
                    : "รับด้วยตนเอง"}
                </Typography>
                {action.row.delivery_address && (
                  <Typography
                    color="text.secondary"
                    sx={{ mt: 0.15, fontSize: ".76rem", overflowWrap: "anywhere" }}
                  >
                    {action.row.delivery_address}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
          {action?.status === "cancelled" && (
            <Alert severity="warning">
              ระบบจะคืนคะแนนที่หักไว้และคืนจำนวนรางวัล พร้อมแจ้งเตือนผู้แจ้ง
            </Alert>
          )}
          {action?.status === "approved" && (
            <Alert severity="info">
              เมื่ออนุมัติแล้ว คำขอจะเข้าสู่ขั้นตอนเตรียมและส่งมอบรางวัล
            </Alert>
          )}
          {action?.status === "fulfilled" && (
            <Alert severity="success">
              โปรดตรวจสอบว่าได้ส่งมอบรางวัลให้ผู้รับเรียบร้อยแล้วก่อนยืนยัน
            </Alert>
          )}
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label={
              action?.status === "cancelled"
                ? "เหตุผลที่ยกเลิก"
                : "หมายเหตุ / รายละเอียดการส่งมอบ"
            }
            required={action?.status === "cancelled"}
            placeholder={
              action?.status === "cancelled"
                ? "ระบุเหตุผลที่ไม่สามารถดำเนินการคำขอนี้ได้"
                : "ระบุรายละเอียดเพิ่มเติมสำหรับผู้รับหรือผู้ดูแล"
            }
            helperText={
              action?.status === "cancelled"
                ? "จำเป็นต้องระบุเหตุผลก่อนยกเลิกคำขอ"
                : `${note.length}/500 ตัวอักษร`
            }
            multiline
            minRows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            slotProps={{ htmlInput: { maxLength: 500 } }}
          />
        </Stack>
      </ActionDialog>
    </Stack>
  );
}
