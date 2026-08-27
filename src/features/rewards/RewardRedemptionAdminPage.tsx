import { Alert, Box, Button, Chip, Stack, Typography } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { GenericDataTable } from "../../components/GenericDataTable";
import { MainCard } from "../../components/base/MainCard";
import { tableColumnAlignment } from "../../components/dataTable.constants";
import {
  getAdminRewardRedemptions,
  updateAdminRewardRedemption,
  type AdminRewardRedemption,
} from "./rewardsApi";

const statusLabels = {
  pending: "รอดำเนินการ",
  fulfilled: "ส่งมอบแล้ว",
  cancelled: "ยกเลิก",
};

export function RewardRedemptionAdminPage() {
  const client = useQueryClient();
  const [error, setError] = useState<string>();
  const items = useQuery({
    queryKey: ["admin-reward-redemptions"],
    queryFn: getAdminRewardRedemptions,
  });
  const update = useMutation({
    mutationFn: updateAdminRewardRedemption,
    onSuccess: async () => {
      setError(undefined);
      await Promise.all([
        client.invalidateQueries({ queryKey: ["admin-reward-redemptions"] }),
        client.invalidateQueries({ queryKey: ["admin-rewards"] }),
      ]);
    },
    onError: (cause) =>
      setError(cause instanceof Error ? cause.message : "บันทึกสถานะไม่สำเร็จ"),
  });
  const columns: GridColDef<AdminRewardRedemption>[] = [
    {
      field: "reward",
      headerName: "รางวัล",
      minWidth: 180,
      flex: 1,
      valueGetter: (_value, row) => row.reward_items?.name ?? "–",
    },
    {
      field: "recipient_name",
      headerName: "ผู้รับ",
      minWidth: 180,
      flex: 1,
    },
    { field: "phone", headerName: "โทรศัพท์", minWidth: 145 },
    {
      field: "fulfillment_method",
      headerName: "วิธีรับ",
      width: 120,
      ...tableColumnAlignment.center,
      valueGetter: (_value, row) =>
        row.fulfillment_method === "delivery" ? "จัดส่ง" : "รับด้วยตนเอง",
    },
    {
      field: "delivery_address",
      headerName: "ที่อยู่",
      minWidth: 220,
      flex: 1.2,
      valueGetter: (_value, row) => row.delivery_address ?? "–",
    },
    {
      field: "status",
      headerName: "สถานะ",
      width: 140,
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
      width: 230,
      ...tableColumnAlignment.actions,
      renderCell: ({ row }) =>
        row.status === "pending" ? (
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
              onClick={() => update.mutate({ id: row.id, status: "fulfilled" })}
            >
              ส่งมอบแล้ว
            </Button>
            <Button
              size="small"
              color="error"
              disabled={update.isPending}
              onClick={() => update.mutate({ id: row.id, status: "cancelled" })}
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
    <Stack spacing={3}>
      <div>
        <Typography variant="h3">การส่งมอบรางวัล</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          ติดตามคำขอรับรางวัลและบันทึกผลการส่งมอบ
        </Typography>
      </div>
      {(items.error || error) && (
        <Alert severity="error">
          {error ||
            (items.error instanceof Error
              ? items.error.message
              : "โหลดรายการไม่สำเร็จ")}
        </Alert>
      )}
      <MainCard>
        <GenericDataTable
          rows={items.data ?? []}
          columns={columns}
          loading={items.isLoading}
          emptyMessage="ยังไม่มีคำขอรับรางวัล"
        />
      </MainCard>
    </Stack>
  );
}
