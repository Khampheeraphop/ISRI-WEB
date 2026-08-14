import GoogleIcon from "@mui/icons-material/Google";
import {
  Alert,
  Button,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Navigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { AuthPageFrame } from "./AuthPageFrame";
import { useAuth } from "../../hooks/useAuth";
import { isSupabaseConfigured } from "../../lib/supabase/client";

export function LoginPage() {
  const { authUser, isLoading, signInWithGoogle, signInWithPassword } =
    useAuth();
  const location = useLocation();
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("reporter@isri.local");
  const [password, setPassword] = useState("IsriDemo123!");
  const returnTo = new URLSearchParams(location.search).get("returnTo") ?? "/";
  const localDemoEnabled =
    import.meta.env.VITE_ENABLE_LOCAL_DEMO_LOGIN === "true";

  if (isLoading)
    return (
      <AuthPageFrame>
        <CircularProgress />
      </AuthPageFrame>
    );
  if (authUser) return <Navigate to="/onboarding" replace />;
  const handleSignIn = async () => {
    try {
      setError(undefined);
      setSubmitting(true);
      await signInWithGoogle(returnTo);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "ไม่สามารถเข้าสู่ระบบได้",
      );
      setSubmitting(false);
    }
  };
  const handlePasswordSignIn = async () => {
    try {
      setError(undefined);
      setSubmitting(true);
      await signInWithPassword(email.trim(), password);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "ไม่สามารถเข้าสู่ระบบได้",
      );
      setSubmitting(false);
    }
  };
  return (
    <AuthPageFrame>
      <Stack spacing={1}>
        <Typography variant="h4">เข้าสู่ระบบ</Typography>
        <Typography color="text.secondary">
          ใช้บัญชี Google เพื่อเข้าสู่ระบบครั้งแรก
          จากนั้นผู้ดูแลจะตรวจสอบและกำหนดสิทธิ์การใช้งาน
        </Typography>
      </Stack>
      {!isSupabaseConfigured && (
        <Alert severity="warning">ยังไม่ได้ตั้งค่าการเชื่อมต่อระบบ</Alert>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      <Button
        fullWidth
        size="large"
        variant="outlined"
        startIcon={submitting ? <CircularProgress size={18} /> : <GoogleIcon />}
        disabled={!isSupabaseConfigured || submitting}
        onClick={() => void handleSignIn()}
      >
        เข้าสู่ระบบด้วย Google
      </Button>
      {localDemoEnabled && (
        <>
          <Divider>สำหรับทดสอบระบบ Local</Divider>
          <Stack spacing={2}>
            <Alert severity="info">
              ใช้บัญชีจาก seed.sql เช่น reporter@isri.local หรือ
              admin@isri.local
            </Alert>
            <TextField
              label="อีเมลบัญชีทดสอบ"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <TextField
              label="รหัสผ่าน"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <Button
              fullWidth
              size="large"
              variant="contained"
              disabled={
                !isSupabaseConfigured ||
                submitting ||
                !email.trim() ||
                !password
              }
              onClick={() => void handlePasswordSignIn()}
            >
              เข้าสู่ระบบด้วยบัญชีทดสอบ
            </Button>
          </Stack>
        </>
      )}
    </AuthPageFrame>
  );
}
