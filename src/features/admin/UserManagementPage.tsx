import {
  CheckCircleOutlined,
  PeopleAltOutlined,
  ManageAccountsOutlined,
} from "@mui/icons-material";
import { Alert, Box, Button, Chip, Stack, Typography } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { GenericDataTable } from "../../components/GenericDataTable";
import { MainCard } from "../../components/base/MainCard";
import { UserApprovalDialog } from "./UserApprovalDialog";
import {
  roleLabels,
  statusColors,
  statusLabels,
} from "./userManagement.constants";
import {
  decideUserApproval,
  getManagedUsers,
  type ManagedUser,
} from "./usersApi";

export function UserManagementPage() {
  const queryClient = useQueryClient();
  const users = useQuery({
    queryKey: ["managed-users"],
    queryFn: getManagedUsers,
  });
  const [selectedUser, setSelectedUser] = useState<ManagedUser>();
  const approval = useMutation({
    mutationFn: decideUserApproval,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["managed-users"] });
      setSelectedUser(undefined);
    },
  });
  const columns: GridColDef<ManagedUser>[] = [
    { field: "fullName", headerName: "ชื่อ–นามสกุล", minWidth: 190, flex: 1 },
    { field: "email", headerName: "อีเมล", minWidth: 240, flex: 1.2 },
    {
      field: "requestedPosition",
      headerName: "ตำแหน่งที่ขอใช้งาน",
      minWidth: 190,
      flex: 1,
      valueGetter: (_value, row) => row.requestedPosition ?? "ยังไม่ระบุ",
    },
    {
      field: "approvalStatus",
      headerName: "สถานะ",
      width: 132,
      renderCell: ({ row }) => (
        <Chip
          size="small"
          color={statusColors[row.approvalStatus]}
          label={statusLabels[row.approvalStatus]}
          variant="outlined"
        />
      ),
    },
    {
      field: "role",
      headerName: "สิทธิ์",
      width: 145,
      valueGetter: (_value, row) => (row.role ? roleLabels[row.role] : "–"),
    },
    {
      field: "actions",
      headerName: "",
      width: 108,
      sortable: false,
      renderCell: ({ row }) => (
        <Button
          size="small"
          variant={row.approvalStatus === "pending" ? "contained" : "outlined"}
          startIcon={
            row.approvalStatus === "pending" ? (
              <CheckCircleOutlined />
            ) : (
              <ManageAccountsOutlined />
            )
          }
          onClick={() => setSelectedUser(row)}
        >
          {row.approvalStatus === "pending" ? "ตรวจสอบ" : "ดูข้อมูล"}
        </Button>
      ),
    },
  ];
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3">จัดการผู้ใช้</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          ตรวจสอบคำขอใช้งาน และกำหนดสิทธิ์ก่อนผู้ใช้เข้าสู่ระบบ
        </Typography>
      </Box>
      <MainCard
        title={
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <PeopleAltOutlined color="primary" />
            <Typography variant="h5">คำขอและบัญชีผู้ใช้</Typography>
          </Stack>
        }
      >
        {users.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {users.error instanceof Error
              ? users.error.message
              : "ไม่สามารถโหลดรายชื่อผู้ใช้ได้"}
          </Alert>
        )}
        <GenericDataTable
          rows={users.data ?? []}
          columns={columns}
          loading={users.isLoading}
          emptyMessage="ยังไม่มีผู้สมัครใช้งาน"
        />
      </MainCard>
      <UserApprovalDialog
        user={selectedUser}
        isSubmitting={approval.isPending}
        error={approval.error}
        onClose={() => setSelectedUser(undefined)}
        onSubmit={(input) =>
          selectedUser && approval.mutate({ id: selectedUser.id, ...input })
        }
      />
    </Stack>
  );
}
