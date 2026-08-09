import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  BlockOutlined,
  CheckCircleOutlined,
  ManageAccountsOutlined,
  ReplayOutlined,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { ActionDialog } from "../../components/feedback/ActionDialog";
import type { ApprovalStatus, TechnicianSpecialty } from "../../types/auth";
import type { Role } from "../../types/user";
import {
  roleLabels,
  specialtyOptions,
  statusLabels,
} from "./userManagement.constants";
import type { ManagedUser } from "./usersApi";

type UserDecision = ApprovalStatus;

interface UserApprovalDialogProps {
  user?: ManagedUser;
  isSubmitting: boolean;
  error: unknown;
  onClose: () => void;
  onSubmit: (input: {
    approvalStatus: UserDecision;
    role?: Role;
    technicianSpecialties?: TechnicianSpecialty[];
    note?: string;
  }) => void;
}

const decisionCopy: Record<
  UserDecision,
  { title: string; description: string; color: "primary" | "error" }
> = {
  approved: {
    title: "ยืนยันการอนุมัติ",
    description: "บัญชีจะสามารถเข้าใช้งานตามสิทธิ์ที่กำหนดได้ทันที",
    color: "primary",
  },
  rejected: {
    title: "ยืนยันการไม่อนุมัติ",
    description: "บัญชีจะไม่สามารถเข้าใช้งานระบบได้",
    color: "error",
  },
  pending: {
    title: "ยืนยันการนำกลับเข้าคิวอนุมัติ",
    description:
      "บัญชีจะกลับไปอยู่สถานะ “รออนุมัติ” ในรายการจัดการผู้ใช้ และยังเข้าใช้งานไม่ได้จนกว่าผู้ดูแลระบบจะอนุมัติอีกครั้ง",
    color: "error",
  },
};

export function UserApprovalDialog({
  user,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: UserApprovalDialogProps) {
  const [role, setRole] = useState<Role>("reporter");
  const [specialties, setSpecialties] = useState<TechnicianSpecialty[]>([]);
  const [note, setNote] = useState("");
  const [decision, setDecision] = useState<UserDecision>();
  useEffect(() => {
    if (!user) return;
    setRole(user.role ?? "reporter");
    setSpecialties(user.technicianSpecialties);
    setNote("");
    setDecision(undefined);
  }, [user]);
  const toggleSpecialty = (specialty: TechnicianSpecialty) =>
    setSpecialties((current) =>
      current.includes(specialty)
        ? current.filter((item) => item !== specialty)
        : [...current, specialty],
    );
  const submit = () => {
    if (!decision) return;
    onSubmit({
      approvalStatus: decision,
      role: decision === "approved" ? role : undefined,
      technicianSpecialties:
        decision === "approved" && role === "technician" ? specialties : [],
      note,
    });
  };
  const requestClose = () => {
    if (!isSubmitting) onClose();
  };
  if (!user) return null;
  const currentIsApproved = user.approvalStatus === "approved";
  return (
    <>
      <ActionDialog
        open
        maxWidth="sm"
        title={currentIsApproved ? "จัดการสิทธิ์ผู้ใช้" : "ตรวจสอบบัญชีผู้ใช้"}
        icon={<ManageAccountsOutlined color="primary" />}
        onRequestClose={requestClose}
        footer={
          <>
            <Button onClick={requestClose} disabled={isSubmitting}>
              ปิด
            </Button>
            {currentIsApproved ? (
              <>
                <Button
                  color="error"
                  onClick={() => setDecision("pending")}
                  disabled={isSubmitting}
                >
                  ระงับสิทธิ์
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setDecision("approved")}
                  disabled={isSubmitting}
                >
                  บันทึกสิทธิ์
                </Button>
              </>
            ) : user.approvalStatus === "rejected" ? (
              <>
                <Button
                  startIcon={<ReplayOutlined />}
                  onClick={() => setDecision("pending")}
                  disabled={isSubmitting}
                >
                  นำกลับเข้าคิวอนุมัติ
                </Button>
                <Button
                  variant="contained"
                  startIcon={<CheckCircleOutlined />}
                  onClick={() => setDecision("approved")}
                  disabled={isSubmitting}
                >
                  อนุมัติการใช้งาน
                </Button>
              </>
            ) : (
              <>
                <Button
                  color="error"
                  startIcon={<BlockOutlined />}
                  onClick={() => setDecision("rejected")}
                  disabled={isSubmitting}
                >
                  ไม่อนุมัติ
                </Button>
                <Button
                  variant="contained"
                  startIcon={<CheckCircleOutlined />}
                  onClick={() => setDecision("approved")}
                  disabled={isSubmitting}
                >
                  อนุมัติการใช้งาน
                </Button>
              </>
            )}
          </>
        }
      >
        <Stack spacing={2.5}>
          {Boolean(error) && (
            <Alert severity="error">
              {error instanceof Error
                ? error.message
                : "ไม่สามารถบันทึกข้อมูลได้"}
            </Alert>
          )}
          <Box>
            <Typography variant="caption" color="text.secondary">
              ผู้สมัคร
            </Typography>
            <Typography sx={{ fontWeight: 700 }}>{user.fullName}</Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              สถานะปัจจุบัน
            </Typography>
            <Typography>
              {statusLabels[user.approvalStatus]}
              {user.role ? ` · ${roleLabels[user.role]}` : ""}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              ตำแหน่งที่แจ้งไว้
            </Typography>
            <Typography>{user.requestedPosition ?? "ยังไม่ระบุ"}</Typography>
          </Box>
          <FormControl fullWidth>
            <InputLabel id="approval-role-label">สิทธิ์การใช้งาน</InputLabel>
            <Select
              labelId="approval-role-label"
              label="สิทธิ์การใช้งาน"
              value={role}
              onChange={(event) => setRole(event.target.value as Role)}
            >
              <MenuItem value="reporter">ผู้แจ้งเหตุ</MenuItem>
              <MenuItem value="technician">ช่างซ่อมบำรุง</MenuItem>
              <MenuItem value="dispatcher">ผู้จัดสรรงาน</MenuItem>
              <MenuItem value="admin">ผู้ดูแลระบบ</MenuItem>
            </Select>
          </FormControl>
          {role === "technician" && (
            <Box>
              <Typography variant="subtitle2">ความเชี่ยวชาญของช่าง</Typography>
              <FormGroup>
                {specialtyOptions.map((option) => (
                  <FormControlLabel
                    key={option.value}
                    label={option.label}
                    control={
                      <Checkbox
                        checked={specialties.includes(option.value)}
                        onChange={() => toggleSpecialty(option.value)}
                      />
                    }
                  />
                ))}
              </FormGroup>
            </Box>
          )}
          <TextField
            label="หมายเหตุ (ถ้ามี)"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            multiline
            minRows={2}
          />
        </Stack>
      </ActionDialog>

      <ActionDialog
        open={Boolean(decision)}
        maxWidth="xs"
        title={decision ? decisionCopy[decision].title : "ยืนยันรายการ"}
        icon={
          decision === "approved" ? (
            <CheckCircleOutlined color="success" />
          ) : (
            <BlockOutlined color="error" />
          )
        }
        onRequestClose={() => !isSubmitting && setDecision(undefined)}
        footer={
          <>
            <Button
              onClick={() => setDecision(undefined)}
              disabled={isSubmitting}
            >
              ยกเลิก
            </Button>
            <Button
              color={decision ? decisionCopy[decision].color : "primary"}
              variant="contained"
              onClick={submit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                "ยืนยัน"
              )}
            </Button>
          </>
        }
      >
        <Typography color="text.secondary">
          {decision ? decisionCopy[decision].description : ""}
        </Typography>
      </ActionDialog>
    </>
  );
}
