import {
  AddOutlined,
  DeleteOutlined,
  EditOutlined,
  PeopleAltOutlined,
} from "@mui/icons-material";
import { Box, Button, IconButton, Stack, Typography } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import { GenericDataTable } from "../../components/GenericDataTable";
import { MainCard } from "../../components/base/MainCard";
import { useEntityDeleteMutation, useEntityQuery } from "../../hooks/useEntity";
import type { Role, User } from "../../types/user";

const labels: Record<Role, string> = {
  reporter: "ผู้แจ้งเหตุ",
  technician: "ช่างซ่อมบำรุง",
  admin: "ผู้ดูแลระบบ",
};

export function UserManagementPage() {
  const users = useEntityQuery("users");
  const remove = useEntityDeleteMutation("users");
  const columns: GridColDef<User>[] = [
    { field: "id", headerName: "รหัส", width: 115 },
    { field: "name", headerName: "ชื่อ–นามสกุล", flex: 1, minWidth: 220 },
    {
      field: "role",
      headerName: "บทบาท",
      width: 150,
      valueFormatter: (value) => labels[value as Role],
    },
    {
      field: "actions",
      headerName: "",
      width: 100,
      sortable: false,
      renderCell: ({ row }) => (
        <Stack direction="row">
          <IconButton
            component={Link}
            to={`/users/${row.id}`}
            aria-label={`แก้ไข ${row.name}`}
          >
            <EditOutlined fontSize="small" />
          </IconButton>
          <IconButton
            color="error"
            aria-label={`ลบ ${row.name}`}
            onClick={() =>
              window.confirm(`ลบผู้ใช้ ${row.name} ใช่หรือไม่`) &&
              remove.mutate(row.id)
            }
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
          <Typography variant="h3">จัดการผู้ใช้</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            กำหนดชื่อและบทบาทผู้ใช้งานในระบบ
          </Typography>
        </Box>
        <Button
          component={Link}
          to="/users/new"
          variant="contained"
          startIcon={<AddOutlined />}
        >
          เพิ่มผู้ใช้
        </Button>
      </Box>
      <MainCard
        title={
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <PeopleAltOutlined color="primary" />
            <Typography variant="h5">รายการผู้ใช้</Typography>
          </Stack>
        }
      >
        <GenericDataTable
          rows={users.data ?? []}
          columns={columns}
          loading={users.isLoading}
          emptyMessage="ยังไม่มีผู้ใช้"
        />
      </MainCard>
    </Stack>
  );
}
