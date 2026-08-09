import GoogleIcon from "@mui/icons-material/Google";
import {
  Alert,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { Navigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { AuthPageFrame } from "./AuthPageFrame";
import { useAuth } from "../../hooks/useAuth";
import { isSupabaseConfigured } from "../../lib/supabase/client";

export function LoginPage() {
  const { authUser, isLoading, signInWithGoogle } = useAuth();
  const location = useLocation();
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const returnTo = new URLSearchParams(location.search).get("returnTo") ?? "/";

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
    </AuthPageFrame>
  );
}
