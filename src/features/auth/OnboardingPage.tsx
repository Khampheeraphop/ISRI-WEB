import LogoutOutlined from "@mui/icons-material/LogoutOutlined";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { saveOnboarding } from "./authApi";
import { AuthPageFrame } from "./AuthPageFrame";
import type { TechnicianSpecialty } from "../../types/auth";
import { clearAuthReturnTo, getAuthReturnTo } from "./authReturnTo";

const specialties: { value: TechnicianSpecialty; label: string }[] = [
  { value: "electrical", label: "งานไฟฟ้า" },
  { value: "plumbing", label: "งานประปา" },
  { value: "air_conditioning", label: "เครื่องปรับอากาศ" },
  { value: "elevator", label: "ลิฟต์" },
  { value: "building", label: "โครงสร้างและพื้นผิวอาคาร" },
];

export function OnboardingPage() {
  const { authUser, profile, isLoading, refreshProfile, signOut } = useAuth();
  const [position, setPosition] = useState(profile?.requestedPosition ?? "");
  const [selected, setSelected] = useState<TechnicianSpecialty[]>(
    profile?.technicianSpecialties ?? [],
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const canSubmit = useMemo(() => position.trim().length >= 2, [position]);
  if (isLoading)
    return (
      <AuthPageFrame>
        <CircularProgress />
      </AuthPageFrame>
    );
  if (!authUser) return <Navigate to="/login" replace />;
  if (profile?.approvalStatus === "approved" && profile.role) {
    const returnTo = getAuthReturnTo() ?? "/";
    clearAuthReturnTo();
    return <Navigate to={returnTo} replace />;
  }
  const handleSubmit = async () => {
    try {
      setError(undefined);
      setSubmitting(true);
      await saveOnboarding(position, selected);
      await refreshProfile();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "บันทึกข้อมูลไม่สำเร็จ",
      );
    } finally {
      setSubmitting(false);
    }
  };
  const toggleSpecialty = (value: TechnicianSpecialty) =>
    setSelected((previous) =>
      previous.includes(value)
        ? previous.filter((item) => item !== value)
        : [...previous, value],
    );
  const isWaiting = Boolean(profile?.requestedPosition);
  const isRejected = profile?.approvalStatus === "rejected";
  const showForm = !isWaiting || isRejected; // Show form for new users or rejected users
  return (
    <AuthPageFrame>
      <Stack spacing={1}>
        <Typography variant="h4">
          {isRejected
            ? "ขอทบทวนสิทธิ์การใช้งาน"
            : isWaiting
              ? "รอการอนุมัติ"
              : "ข้อมูลสำหรับขอใช้งาน"}
        </Typography>
        <Typography color="text.secondary">
          {profile?.fullName || authUser.email}
        </Typography>
        <Typography color="text.secondary">
          {isWaiting
            ? "ผู้ดูแลจะตรวจสอบข้อมูลและกำหนดสิทธิ์ให้ก่อนเริ่มใช้งาน"
            : "กรอกตำแหน่งที่ต้องการใช้งานเพื่อส่งให้ผู้ดูแลตรวจสอบ"}
        </Typography>
      </Stack>
      {error && <Alert severity="error">{error}</Alert>}
      {isWaiting && (
        <>
          <Alert
            severity={profile?.approvalStatus === "rejected" ? "error" : "info"}
          >
            {profile?.approvalStatus === "rejected"
              ? "คำขอของคุณยังไม่ได้รับอนุมัติ คุณสามารถแก้ไขข้อมูลและขอทบทวนสิทธิ์ได้"
              : "ส่งข้อมูลแล้ว กรุณารอผู้ดูแลอนุมัติบัญชี"}
          </Alert>
          {profile?.approvalStatus === "rejected" && (
            <Alert severity="info">
              คุณสามารถแก้ไขตำแหน่งและความเชี่ยวชาญด้านช่างด้านล่าง หรือกดปุ่ม
              "ส่งข้อมูลเพื่อขอใช้งาน" เพื่อขอทบทวนสิทธิ์
            </Alert>
          )}
        </>
      )}
      {showForm && (
        <Stack spacing={2}>
          <TextField
            label="ตำแหน่งหรือหน้าที่ที่ต้องการใช้งาน"
            required
            value={position}
            onChange={(event) => setPosition(event.target.value)}
            slotProps={{ htmlInput: { maxLength: 120 } }}
          />
          <Box>
            <Typography variant="subtitle2">
              ความเชี่ยวชาญด้านช่าง (ถ้ามี)
            </Typography>
            <FormGroup>
              {specialties.map((item) => (
                <FormControlLabel
                  key={item.value}
                  label={item.label}
                  control={
                    <Checkbox
                      checked={selected.includes(item.value)}
                      onChange={() => toggleSpecialty(item.value)}
                    />
                  }
                />
              ))}
            </FormGroup>
          </Box>
          <Button
            variant="contained"
            size="large"
            disabled={!canSubmit || submitting}
            onClick={() => void handleSubmit()}
          >
            {submitting
              ? "กำลังบันทึก"
              : isRejected
                ? "ขอทบทวนสิทธิ์"
                : "ส่งข้อมูลเพื่อขอใช้งาน"}
          </Button>
        </Stack>
      )}
      <Button
        color="inherit"
        startIcon={<LogoutOutlined />}
        onClick={() => void signOut()}
      >
        ออกจากระบบ
      </Button>
    </AuthPageFrame>
  );
}
