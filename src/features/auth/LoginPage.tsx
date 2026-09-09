import GoogleIcon from "@mui/icons-material/Google";
import LockOutlined from "@mui/icons-material/LockOutlined";
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
import { saveAuthReturnTo } from "./authReturnTo";

export function LoginPage() {
  const { authUser, isLoading, signInWithGoogle, signInWithPassword } =
    useAuth();
  const location = useLocation();
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("nattaya.nurse@isri.local");
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
      saveAuthReturnTo(returnTo);
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
      <Stack spacing={1.25}>
        <Typography variant="h3" component="h1">
          เข้าสู่ระบบ
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 440 }}>
          เข้าใช้งานระบบด้วยบัญชี Google ของคุณ
          ผู้ใช้งานครั้งแรกจะได้รับการตรวจสอบสิทธิ์จากผู้ดูแลระบบ
        </Typography>
      </Stack>
      {!isSupabaseConfigured && (
        <Alert severity="warning">ยังไม่ได้ตั้งค่าการเชื่อมต่อระบบ</Alert>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      <Button
        fullWidth
        size="large"
        variant="contained"
        startIcon={submitting ? <CircularProgress size={18} /> : <GoogleIcon />}
        disabled={!isSupabaseConfigured || submitting}
        onClick={() => void handleSignIn()}
        sx={{
          minHeight: 54,
          borderRadius: 2,
          fontSize: "1rem",
          background: "linear-gradient(135deg, #4B3B86 0%, #6754A8 100%)",
          boxShadow: "0 12px 28px rgba(75,59,134,.22)",
          "&:hover": {
            boxShadow: "0 15px 32px rgba(75,59,134,.3)",
          },
        }}
      >
        เข้าสู่ระบบด้วย Google
      </Button>
      {localDemoEnabled && (
        <>
          <Divider sx={{ color: "text.secondary", fontSize: ".8rem" }}>
            หรือบัญชีสำหรับทดสอบระบบ
          </Divider>
          <Stack spacing={2}>
            <TextField
              label="อีเมล"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              slotProps={{
                input: { sx: { borderRadius: 2, bgcolor: "#fff" } },
              }}
            />
            <TextField
              label="รหัสผ่าน"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              slotProps={{
                input: { sx: { borderRadius: 2, bgcolor: "#fff" } },
              }}
            />
            <Button
              fullWidth
              size="large"
              variant="outlined"
              startIcon={<LockOutlined />}
              disabled={
                !isSupabaseConfigured ||
                submitting ||
                !email.trim() ||
                !password
              }
              onClick={() => void handlePasswordSignIn()}
              sx={{ minHeight: 50, borderRadius: 2 }}
            >
              เข้าสู่ระบบด้วยบัญชีทดสอบ
            </Button>
          </Stack>
        </>
      )}
    </AuthPageFrame>
  );
}
