import {
  AddOutlined,
  DeleteOutlined,
  EditOutlined,
  Inventory2Outlined,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { GenericDataTable } from "../../components/GenericDataTable";
import { MainCard } from "../../components/base/MainCard";
import { tableColumnAlignment } from "../../components/dataTable.constants";
import { ActionDialog } from "../../components/feedback/ActionDialog";
import { deleteReward, getAdminRewards, type Reward } from "./rewardsApi";

export function RewardCatalogAdminPage() {
  const client = useQueryClient();
  const rewards = useQuery({
    queryKey: ["admin-rewards"],
    queryFn: getAdminRewards,
  });
  const [target, setTarget] = useState<Reward>();
  const remove = useMutation({
    mutationFn: deleteReward,
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["admin-rewards"] });
      setTarget(undefined);
    },
  });
  const columns: GridColDef<Reward>[] = [
    {
      field: "imageUrl",
      headerName: "รูป",
      width: 84,
      sortable: false,
      ...tableColumnAlignment.center,
      renderCell: ({ row }) => (
        <Avatar
          variant="rounded"
          alt={row.name}
          src={row.imageUrl ?? undefined}
          sx={{
            width: 48,
            height: 48,
            bgcolor: "#F7F7FA",
            "& .MuiAvatar-img": { objectFit: "contain", p: 0.25 },
          }}
        />
      ),
    },
    { field: "name", headerName: "ของรางวัล", minWidth: 220, flex: 1 },
    {
      field: "pointCost",
      headerName: "คะแนนแลก",
      minWidth: 90,
      type: "number",
      ...tableColumnAlignment.numeric,
      renderCell: ({ row }) =>
        row.isActive && row.rewardPeriod === "standard"
          ? row.pointCost.toLocaleString("th-TH")
          : "–",
    },
    {
      field: "stock",
      headerName: "คงเหลือ",
      minWidth: 95,
      type: "number",
      ...tableColumnAlignment.numeric,
    },
    {
      field: "usage",
      headerName: "ประเภทของรางวัล",
      minWidth: 175,
      ...tableColumnAlignment.center,
      renderCell: ({ row }) => (
        <Chip
          size="small"
          color={
            row.rewardPeriod === "annual"
              ? "secondary"
              : row.isActive
                ? "success"
                : "default"
          }
          variant="outlined"
          label={
            row.rewardPeriod === "annual"
              ? "รางวัลประจำปี"
              : row.isActive
                ? "แลกด้วยคะแนน"
                : "รางวัลแคมเปญ"
          }
        />
      ),
    },
    {
      field: "actions",
      headerName: "จัดการ",
      width: 112,
      ...tableColumnAlignment.actions,
      renderCell: ({ row }) => (
        <Stack direction="row">
          <IconButton
            component={Link}
            to={`/rewards/manage/${row.id}`}
            aria-label={`แก้ไข ${row.name}`}
          >
            <EditOutlined fontSize="small" />
          </IconButton>
          <IconButton
            aria-label={`ลบ ${row.name}`}
            color="error"
            onClick={() => setTarget(row)}
          >
            <DeleteOutlined fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Box>
          <Typography variant="h3">จัดการของรางวัล</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            รายการรางวัล รูปประกอบ และจำนวนคงเหลือสำหรับแลก
          </Typography>
        </Box>
        <Button
          component={Link}
          to="/rewards/manage/new"
          variant="contained"
          startIcon={<AddOutlined />}
        >
          เพิ่มของรางวัล
        </Button>
      </Box>
      {rewards.isError && (
        <Alert severity="error">ไม่สามารถโหลดรายการของรางวัลได้</Alert>
      )}
      <MainCard
        title={
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Inventory2Outlined color="primary" />
            <Typography variant="h5">รายการของรางวัล</Typography>
          </Stack>
        }
      >
        <GenericDataTable
          rows={rewards.data ?? []}
          columns={columns}
          loading={rewards.isLoading}
          emptyMessage="ยังไม่มีของรางวัล"
        />
      </MainCard>
      <ActionDialog
        open={Boolean(target)}
        maxWidth="xs"
        title="ยืนยันการลบของรางวัล"
        icon={<DeleteOutlined color="error" />}
        onRequestClose={() => !remove.isPending && setTarget(undefined)}
        footer={
          <>
            <Button onClick={() => setTarget(undefined)} disabled={remove.isPending}>
              ยกเลิก
            </Button>
            <Button
              color="error"
              variant="contained"
              onClick={() => target && remove.mutate(target.id)}
              disabled={remove.isPending}
            >
              ลบของรางวัล
            </Button>
          </>
        }
      >
        {target && (
          <Typography color="text.secondary">
            ลบ “{target.name}” ออกจากระบบใช่หรือไม่
          </Typography>
        )}
        {remove.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            ไม่สามารถลบของรางวัลได้ อาจมีรายการแลกอ้างอิงอยู่
          </Alert>
        )}
      </ActionDialog>
    </Stack>
  );
}
