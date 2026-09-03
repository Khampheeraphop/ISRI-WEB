import {
  CheckCircleOutlined,
  PeopleAltOutlined,
  ManageAccountsOutlined,
} from "@mui/icons-material";
import { Alert, Box, Button, Chip, Stack, Typography } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { GenericDataTable } from "../../components/GenericDataTable";
import { MainCard } from "../../components/base/MainCard";
import { tableColumnAlignment } from "../../components/dataTable.constants";
import { UserApprovalDialog } from "./UserApprovalDialog";
import {
  roleLabels,
  statusColors,
  statusLabels,
} from "./userManagement.constants";
import {
  bulkApproveReporters,
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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const orderedUsers = useMemo(() => {
    const statusOrder = { pending: 0, rejected: 1, approved: 2 } as const;
    return [...(users.data ?? [])].sort((left, right) => {
      const statusDifference =
        statusOrder[left.approvalStatus] - statusOrder[right.approvalStatus];
      if (statusDifference !== 0) return statusDifference;
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });
  }, [users.data]);
  const pendingCount = orderedUsers.filter(
    (user) => user.approvalStatus === "pending",
  ).length;
  const approval = useMutation({
    mutationFn: decideUserApproval,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["managed-users"] });
      setSelectedUser(undefined);
    },
  });
  const bulkApproval = useMutation({
    mutationFn: bulkApproveReporters,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["managed-users"] });
      setSelectedIds([]);
    },
  });
  const columns: GridColDef<ManagedUser>[] = [
    { field: "fullName", headerName: "ชื่อ–นามสกุล", minWidth: 190, flex: 1 },
    { field: "email", headerName: "อีเมล", minWidth: 240, flex: 1.2 },
    {
      field: "approvalStatus",
      headerName: "สถานะ",
      width: 132,
      ...tableColumnAlignment.center,
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
      ...tableColumnAlignment.center,
      valueGetter: (_value, row) => (row.role ? roleLabels[row.role] : "–"),
    },
    {
      field: "actions",
      headerName: "จัดการ",
      width: 124,
      ...tableColumnAlignment.actions,
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
        <Alert severity="info" sx={{ mb: 2 }}>
          {pendingCount > 0
            ? `มีคำขอรออนุมัติ ${pendingCount} รายการ ซึ่งแสดงไว้ด้านบนของตาราง `
            : "ไม่มีคำขอรออนุมัติในขณะนี้ "}
          สำหรับบุคลากรจำนวนมาก ให้เลือกบัญชีที่รออนุมัติแล้วอนุมัติเป็น
          “ผู้แจ้งเหตุ” พร้อมกัน ส่วนสิทธิ์ช่าง ผู้จัดสรรงาน และผู้ดูแลระบบ
          ควรตรวจสอบรายบุคคล
        </Alert>
        {bulkApproval.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {bulkApproval.error instanceof Error
              ? bulkApproval.error.message
              : "ไม่สามารถอนุมัติหลายบัญชีได้"}
          </Alert>
        )}
        {selectedIds.length > 0 && (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ mb: 2, alignItems: { sm: "center" } }}
          >
            <Typography color="text.secondary">
              เลือกบัญชีที่รออนุมัติ {selectedIds.length} รายการ
            </Typography>
            <Button
              variant="contained"
              disabled={bulkApproval.isPending}
              onClick={() => bulkApproval.mutate(selectedIds)}
            >
              อนุมัติเป็นผู้แจ้งเหตุ
            </Button>
          </Stack>
        )}
        <GenericDataTable
          rows={orderedUsers}
          columns={columns}
          loading={users.isLoading}
          emptyMessage="ยังไม่มีผู้สมัครใช้งาน"
          showPagination
          checkboxSelection
          isRowSelectable={(params) => params.row.approvalStatus === "pending"}
          rowSelectionModel={{ type: "include", ids: new Set(selectedIds) }}
          onRowSelectionModelChange={(model) =>
            setSelectedIds(Array.from(model.ids).map(String))
          }
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
