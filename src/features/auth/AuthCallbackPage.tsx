import {
  Alert,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthPageFrame } from "./AuthPageFrame";
import { supabase } from "../../lib/supabase/client";
import { useAuth } from "../../hooks/useAuth";
import { clearAuthReturnTo, getQrReportReturnTo } from "./authReturnTo";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [error, setError] = useState<string>();
  const exchangeStarted = useRef(false);

  useEffect(() => {
    if (exchangeStarted.current) return;
    exchangeStarted.current = true;

    const complete = async () => {
      try {
        if (!supabase) throw new Error("ยังไม่ได้ตั้งค่าการเชื่อมต่อระบบ");
        const code = new URLSearchParams(window.location.search).get("code");
        if (!code) throw new Error("ไม่พบรหัสยืนยันการเข้าสู่ระบบ");

        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) throw exchangeError;

        // Do not leave a single-use OAuth code in the address bar.
        window.history.replaceState(null, "", window.location.pathname);
        const profile = await refreshProfile();
        if (profile?.approvalStatus === "approved" && profile.role) {
          const returnTo = getQrReportReturnTo() ?? "/";
          clearAuthReturnTo();
          navigate(returnTo, { replace: true });
          return;
        }
        navigate("/onboarding", { replace: true });
      } catch (cause) {
        const message =
          cause instanceof Error
            ? cause.message
            : "ไม่สามารถยืนยันการเข้าสู่ระบบได้";
        setError(
          message.includes("PKCE code verifier")
            ? "คำขอเข้าสู่ระบบหมดอายุหรือถูกเปิดคนละเบราว์เซอร์ กรุณากลับไปเริ่มเข้าสู่ระบบด้วย Google ใหม่"
            : message,
        );
      }
    };
    void complete();
  }, [navigate, refreshProfile]);
  return (
    <AuthPageFrame>
      <Stack spacing={2} sx={{ alignItems: "center" }}>
        {error ? (
          <Alert severity="error" sx={{ width: "100%" }}>
            {error}
          </Alert>
        ) : (
          <CircularProgress />
        )}
        <Typography>
          {error ? "กรุณาลองเข้าสู่ระบบอีกครั้ง" : "กำลังยืนยันการเข้าสู่ระบบ"}
        </Typography>
        {error ? (
          <Button
            variant="contained"
            onClick={() => navigate("/login", { replace: true })}
          >
            กลับไปหน้าเข้าสู่ระบบ
          </Button>
        ) : null}
      </Stack>
    </AuthPageFrame>
  );
}
