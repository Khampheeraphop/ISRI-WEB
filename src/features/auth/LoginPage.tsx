import GoogleIcon from "@mui/icons-material/Google";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import KeyboardArrowDownRounded from "@mui/icons-material/KeyboardArrowDownRounded";
import LockOutlined from "@mui/icons-material/LockOutlined";
import VisibilityOffOutlined from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Collapse,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Navigate, useLocation } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { AuthPageFrame } from "./AuthPageFrame";
import { useAuth } from "../../hooks/useAuth";
import { isSupabaseConfigured } from "../../lib/supabase/client";
import { saveAuthReturnTo } from "./authReturnTo";

const inputStyles = {
  "& .MuiOutlinedInput-root": {
    minHeight: 52,
    borderRadius: 2,
    "& fieldset": { borderColor: "#C9C2D6" },
    "&:hover fieldset": { borderColor: "#74649A" },
    "&.Mui-focused": {
      boxShadow: "0 0 0 3px rgba(75,59,134,.14)",
    },
    "&.Mui-focused fieldset": { borderColor: "#4B3B86", borderWidth: 2 },
  },
  "& .MuiInputLabel-root": { color: "#554C68" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#3B2E70" },
} as const;

export function LoginPage() {
  const { authUser, isLoading, signInWithGoogle, signInWithPassword } =
    useAuth();
  const location = useLocation();
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const returnTo = new URLSearchParams(location.search).get("returnTo") ?? "/";
  const localDemoEnabled =
    import.meta.env.VITE_ENABLE_LOCAL_DEMO_LOGIN === "true";

  if (isLoading) {
    return (
      <AuthPageFrame>
        <Box sx={{ minHeight: 320, display: "grid", placeItems: "center" }}>
          <CircularProgress aria-label="กำลังตรวจสอบสถานะการเข้าสู่ระบบ" />
        </Box>
      </AuthPageFrame>
    );
  }
  if (authUser) return <Navigate to="/onboarding" replace />;

  const handleGoogleSignIn = async () => {
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

  const handlePasswordSignIn = async (event?: FormEvent) => {
    event?.preventDefault();
    try {
      setError(undefined);
      setSubmitting(true);
      saveAuthReturnTo(returnTo);
      await signInWithPassword(email.trim(), password);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
      );
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async () => {
    const demoEmail = "nattaya.nurse@isri.local";
    const demoPassword = "IsriDemo123!";
    setEmail(demoEmail);
    setPassword(demoPassword);
    try {
      setError(undefined);
      setSubmitting(true);
      saveAuthReturnTo(returnTo);
      await signInWithPassword(demoEmail, demoPassword);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "ไม่สามารถใช้บัญชีสาธิตได้",
      );
      setSubmitting(false);
    }
  };

  return (
    <AuthPageFrame>
      <Stack spacing={1}>
        <Typography
          variant="h3"
          component="h1"
          sx={{ color: "#211936", letterSpacing: "-.02em" }}
        >
          ยินดีต้อนรับ
        </Typography>
        <Typography sx={{ color: "#5C536C", lineHeight: 1.7 }}>
          เข้าสู่ระบบเพื่อแจ้งเหตุ ติดตามงานซ่อม และประสานงานภายในโรงพยาบาล
        </Typography>
      </Stack>

      <Stack spacing={2.5}>
        <Box
          role="note"
          sx={{
            display: "flex",
            gap: 1.25,
            alignItems: "flex-start",
            p: 1.5,
            borderRadius: 2,
            color: "#3C3260",
            bgcolor: "#F4F1F9",
            border: "1px solid #E2DAEF",
          }}
        >
          <InfoOutlined sx={{ mt: "2px", fontSize: 20, flex: "0 0 auto" }} />
          <Typography sx={{ fontSize: ".84rem", lineHeight: 1.65 }}>
            เข้าใช้งานระบบครั้งแรก ต้องรอการอนุมัติสิทธิ์จากผู้ดูแลระบบ
          </Typography>
        </Box>

        {!isSupabaseConfigured && (
          <Alert severity="warning">ยังไม่ได้ตั้งค่าการเชื่อมต่อระบบ</Alert>
        )}
        {error && (
          <Alert severity="error" role="alert">
            {error}
          </Alert>
        )}

        <Button
          fullWidth
          size="large"
          variant="contained"
          startIcon={
            submitting ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <GoogleIcon />
            )
          }
          disabled={!isSupabaseConfigured || submitting}
          onClick={() => void handleGoogleSignIn()}
          sx={{
            minHeight: 54,
            borderRadius: 2,
            fontSize: "1rem",
            background: "linear-gradient(135deg, #443476 0%, #5C4792 100%)",
            boxShadow: "0 10px 24px rgba(68,52,118,.22)",
            "&:hover": {
              background: "linear-gradient(135deg, #382A66 0%, #4F3B83 100%)",
              boxShadow: "0 13px 28px rgba(68,52,118,.28)",
            },
            "&:focus-visible": {
              outline: "3px solid rgba(75,59,134,.28)",
              outlineOffset: 3,
            },
          }}
        >
          เข้าสู่ระบบด้วย Google
        </Button>

        <Divider sx={{ color: "#665D75", fontSize: ".78rem" }}>
          หรือใช้บัญชีเจ้าหน้าที่
        </Divider>

        <Stack
          component="form"
          spacing={2}
          noValidate
          onSubmit={(event) => void handlePasswordSignIn(event)}
        >
          <TextField
            required
            fullWidth
            label="อีเมลเจ้าหน้าที่"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@hospital.org"
            sx={inputStyles}
          />
          <TextField
            required
            fullWidth
            label="รหัสผ่าน"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            sx={inputStyles}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                    >
                      {showPassword ? (
                        <VisibilityOffOutlined />
                      ) : (
                        <VisibilityOutlined />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button
            fullWidth
            type="submit"
            size="large"
            variant="outlined"
            startIcon={<LockOutlined />}
            disabled={
              !isSupabaseConfigured || submitting || !email.trim() || !password
            }
            sx={{
              minHeight: 50,
              borderRadius: 2,
              borderWidth: 1.5,
              color: "#3E3073",
              borderColor: "#74649A",
              "&:hover": { borderWidth: 1.5, bgcolor: "#F6F3FA" },
              "&:focus-visible": {
                outline: "3px solid rgba(75,59,134,.22)",
                outlineOffset: 3,
              },
            }}
          >
            เข้าสู่ระบบ
          </Button>
        </Stack>

        {localDemoEnabled && (
          <Box sx={{ textAlign: "center" }}>
            <Button
              size="small"
              color="inherit"
              endIcon={
                <KeyboardArrowDownRounded
                  sx={{
                    transition: "transform .2s ease",
                    transform: showDemo ? "rotate(180deg)" : "none",
                  }}
                />
              }
              aria-expanded={showDemo}
              aria-controls="demo-login-panel"
              onClick={() => setShowDemo((value) => !value)}
              sx={{ color: "#6A6275", fontSize: ".75rem", fontWeight: 500 }}
            >
              ตัวเลือกสำหรับทดสอบระบบ
            </Button>
            <Collapse in={showDemo}>
              <Box
                id="demo-login-panel"
                sx={{
                  mt: 1,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: "#FAF9FC",
                  border: "1px dashed #CDC5DA",
                }}
              >
                <Button
                  size="small"
                  disabled={!isSupabaseConfigured || submitting}
                  onClick={() => void handleQuickLogin()}
                  sx={{ color: "#51466A" }}
                >
                  Quick Login · บัญชีผู้แจ้งเหตุ
                </Button>
              </Box>
            </Collapse>
          </Box>
        )}
      </Stack>
    </AuthPageFrame>
  );
}
