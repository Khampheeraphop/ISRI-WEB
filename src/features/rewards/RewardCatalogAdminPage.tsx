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
import { useState } from "react";
import { Link } from "react-router-dom";
import { GenericDataTable } from "../../components/GenericDataTable";
import { MainCard } from "../../components/base/MainCard";
import { useEntityDeleteMutation, useEntityQuery } from "../../hooks/useEntity";
import type { RewardItem } from "../../types/reward";

export function RewardCatalogAdminPage() {
  const rewards = useEntityQuery("rewardItems");
  const fileStorages = useEntityQuery("fileStorages");
  const deleteReward = useEntityDeleteMutation("rewardItems");
  const [feedback, setFeedback] = useState<{
    severity: "success" | "error";
    message: string;
  }>();
  const storageById = new Map(
    (fileStorages.data ?? []).map((file) => [file.id, file]),
  );
  const columns: GridColDef<RewardItem>[] = [
    {
      field: "imageFileStorageId",
      headerName: "รูป",
      width: 84,
      sortable: false,
      renderCell: ({ value, row }) => (
        <Avatar
          variant="rounded"
          alt={row.name}
          src={storageById.get(value)?.publicUrl}
          sx={{ width: 48, height: 48, bgcolor: "background.default" }}
        />
      ),
    },
    { field: "name", headerName: "ของรางวัล", minWidth: 220, flex: 1 },
    { field: "pointCost", headerName: "แต้ม", minWidth: 90, type: "number" },
    { field: "stock", headerName: "คงเหลือ", minWidth: 95, type: "number" },
    {
      field: "rewardPeriod",
      headerName: "รอบรางวัล",
      minWidth: 125,
      renderCell: ({ value }) => (
        <Chip
          size="small"
          color={value === "annual" ? "secondary" : "default"}
          variant="outlined"
          label={value === "annual" ? "ประจำปี" : "ทั่วไป"}
        />
      ),
    },
    {
      field: "isActive",
      headerName: "สถานะ",
      minWidth: 115,
      renderCell: ({ row }) => (
        <Chip
          size="small"
          color={row.isActive ? "success" : "default"}
          variant="outlined"
          label={row.isActive ? "เปิดให้แลก" : "ปิดการแลก"}
        />
      ),
    },
    {
      field: "actions",
      headerName: "",
      width: 105,
      sortable: false,
      renderCell: ({ row }) => (
        <Stack direction="row">
          <IconButton
            component={Link}
            to={"/rewards/manage/" + row.id}
            aria-label={"แก้ไข " + row.name}
          >
            <EditOutlined fontSize="small" />
          </IconButton>
          <IconButton
            aria-label={"ลบ " + row.name}
            color="error"
            onClick={() => {
              if (window.confirm("ลบของรางวัล “" + row.name + "” ใช่หรือไม่"))
                deleteReward.mutate(row.id, {
                  onSuccess: () =>
                    setFeedback({
                      severity: "success",
                      message: "ลบของรางวัลแล้ว",
                    }),
                  onError: () =>
                    setFeedback({
                      severity: "error",
                      message: "ไม่สามารถลบของรางวัลได้",
                    }),
                });
            }}
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
      {feedback && (
        <Alert
          severity={feedback.severity}
          onClose={() => setFeedback(undefined)}
        >
          {feedback.message}
        </Alert>
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
          loading={rewards.isLoading || fileStorages.isLoading}
          emptyMessage="ยังไม่มีของรางวัล"
        />
      </MainCard>
    </Stack>
  );
}
