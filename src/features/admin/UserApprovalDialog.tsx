import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
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
import { useEffect, useState } from "react";
import type { TechnicianSpecialty } from "../../types/auth";
import type { Role } from "../../types/user";
import { roleLabels, specialtyOptions, statusLabels } from "./userManagement.constants";
import type { ManagedUser } from "./usersApi";

interface UserApprovalDialogProps {
  user?: ManagedUser;
  isSubmitting: boolean;
  error: unknown;
  onClose: () => void;
  onSubmit: (input: { approvalStatus: "approved" | "rejected"; role?: Role; technicianSpecialties?: TechnicianSpecialty[]; note?: string }) => void;
}

export function UserApprovalDialog({ user, isSubmitting, error, onClose, onSubmit }: UserApprovalDialogProps) {
  const [role, setRole] = useState<Role>("reporter");
  const [specialties, setSpecialties] = useState<TechnicianSpecialty[]>([]);
  const [note, setNote] = useState("");
  useEffect(() => {
    if (!user) return;
    setRole(user.role ?? "reporter");
    setSpecialties(user.technicianSpecialties);
    setNote("");
  }, [user]);
  const toggleSpecialty = (specialty: TechnicianSpecialty) => setSpecialties((current) => current.includes(specialty) ? current.filter((item) => item !== specialty) : [...current, specialty]);
  const submit = (approvalStatus: "approved" | "rejected") => onSubmit({ approvalStatus, role: approvalStatus === "approved" ? role : undefined, technicianSpecialties: role === "technician" ? specialties : [], note });
  return (
    <Dialog open={Boolean(user)} onClose={() => !isSubmitting && onClose()} maxWidth="sm" fullWidth>
      {user && <>
        <DialogTitle>{user.approvalStatus === "pending" ? "ตรวจสอบคำขอใช้งาน" : "ข้อมูลผู้ใช้"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            {Boolean(error) && <Alert severity="error">{error instanceof Error ? error.message : "ไม่สามารถบันทึกได้"}</Alert>}
            <Box><Typography variant="caption" color="text.secondary">ผู้สมัคร</Typography><Typography sx={{ fontWeight: 700 }}>{user.fullName}</Typography><Typography variant="body2" color="text.secondary">{user.email}</Typography></Box>
            <Divider />
            <Box><Typography variant="caption" color="text.secondary">ตำแหน่งที่ขอใช้งาน</Typography><Typography>{user.requestedPosition ?? "ยังไม่ระบุ"}</Typography></Box>
            {user.approvalStatus === "pending" && <>
              <FormControl fullWidth><InputLabel id="approval-role-label">สิทธิ์การใช้งาน</InputLabel><Select labelId="approval-role-label" label="สิทธิ์การใช้งาน" value={role} onChange={(event) => setRole(event.target.value as Role)}><MenuItem value="reporter">ผู้แจ้งเหตุ</MenuItem><MenuItem value="technician">ช่างซ่อมบำรุง</MenuItem><MenuItem value="admin">ผู้ดูแลระบบ</MenuItem></Select></FormControl>
              {role === "technician" && <Box><Typography variant="subtitle2">ความเชี่ยวชาญของช่าง</Typography><FormGroup>{specialtyOptions.map((option) => <FormControlLabel key={option.value} label={option.label} control={<Checkbox checked={specialties.includes(option.value)} onChange={() => toggleSpecialty(option.value)} />} />)}</FormGroup></Box>}
              <TextField label="หมายเหตุ (ถ้ามี)" value={note} onChange={(event) => setNote(event.target.value)} multiline minRows={2} />
            </>}
            {user.approvalStatus !== "pending" && <Alert severity={user.approvalStatus === "approved" ? "success" : "error"}>{statusLabels[user.approvalStatus]}{user.role ? ` · ${roleLabels[user.role]}` : ""}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>ปิด</Button>
          {user.approvalStatus === "pending" && <><Button color="error" onClick={() => submit("rejected")} disabled={isSubmitting}>ไม่อนุมัติ</Button><Button variant="contained" onClick={() => submit("approved")} disabled={isSubmitting}>{isSubmitting ? <CircularProgress size={18} color="inherit" /> : "อนุมัติการใช้งาน"}</Button></>}
        </DialogActions>
      </>}
    </Dialog>
  );
}
