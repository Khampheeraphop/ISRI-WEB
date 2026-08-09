import { Alert, CircularProgress, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthPageFrame } from "./AuthPageFrame";
import { supabase } from "../../lib/supabase/client";
import { useAuth } from "../../hooks/useAuth";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [error, setError] = useState<string>();
  useEffect(() => {
    const complete = async () => {
      try {
        if (!supabase) throw new Error("ยังไม่ได้ตั้งค่าการเชื่อมต่อระบบ");
        const code = new URLSearchParams(window.location.search).get("code");
        if (code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        }
        await refreshProfile();
        navigate("/onboarding", { replace: true });
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "ไม่สามารถยืนยันการเข้าสู่ระบบได้",
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
      </Stack>
    </AuthPageFrame>
  );
}
