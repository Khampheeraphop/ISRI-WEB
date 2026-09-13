import LocalHospitalRounded from "@mui/icons-material/LocalHospitalRounded";
import VerifiedUserOutlined from "@mui/icons-material/VerifiedUserOutlined";
import { Box, Stack, Typography } from "@mui/material";
import type { PropsWithChildren } from "react";

function BrandMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <Box
      aria-hidden="true"
      sx={{
        width: 44,
        height: 44,
        flex: "0 0 auto",
        display: "grid",
        placeItems: "center",
        borderRadius: 2.5,
        color: inverse ? "#FFFFFF" : "#4B3B86",
        bgcolor: inverse ? "rgba(255,255,255,.14)" : "#F0ECF8",
        border: inverse
          ? "1px solid rgba(255,255,255,.32)"
          : "1px solid #E2DAF0",
        backdropFilter: inverse ? "blur(12px)" : undefined,
      }}
    >
      <LocalHospitalRounded sx={{ fontSize: 25 }} />
    </Box>
  );
}

export function AuthPageFrame({ children }: PropsWithChildren) {
  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "grid",
        gridTemplateColumns: {
          xs: "minmax(0, 1fr)",
          md: "minmax(0, 1.06fr) minmax(480px, .94fr)",
        },
        bgcolor: "#FFFFFF",
      }}
    >
      <Box
        component="section"
        aria-label="บุคลากรทางการแพทย์และช่างซ่อมบำรุงร่วมตรวจสอบพื้นที่โรงพยาบาล"
        sx={{
          display: { xs: "none", md: "flex" },
          minHeight: "100dvh",
          position: "relative",
          isolation: "isolate",
          overflow: "hidden",
          flexDirection: "column",
          justifyContent: "space-between",
          p: { md: 5, lg: 7 },
          color: "#FFFFFF",
          backgroundImage:
            "linear-gradient(180deg, rgba(12,18,43,.58) 0%, rgba(12,18,43,.08) 42%, rgba(12,18,43,.94) 100%), url('/images/isri-login-hospital-hero-v2.png')",
          backgroundSize: "cover",
          backgroundPosition: "center 45%",
          "&::after": {
            content: '\"\"',
            position: "absolute",
            zIndex: -1,
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(53,41,104,.24), transparent 54%)",
          },
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <BrandMark inverse />
          <Box>
            <Typography
              sx={{ fontSize: "1.35rem", fontWeight: 700, lineHeight: 1.2 }}
            >
              ISRI
            </Typography>
            <Typography
              sx={{
                mt: 0.25,
                color: "rgba(255,255,255,.84)",
                fontSize: ".72rem",
                fontWeight: 500,
                letterSpacing: ".08em",
              }}
            >
              HOSPITAL FACILITY REPORTING
            </Typography>
          </Box>
        </Stack>

        <Stack spacing={2.25} sx={{ maxWidth: 590 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <VerifiedUserOutlined sx={{ fontSize: 19, color: "#F4C56F" }} />
            <Typography sx={{ fontSize: ".9rem", fontWeight: 600 }}>
              เพื่อสถานพยาบาลที่ปลอดภัยสำหรับทุกคน
            </Typography>
          </Stack>
          <Typography
            component="h2"
            sx={{
              maxWidth: 560,
              fontSize: { md: "2.35rem", lg: "3rem" },
              fontWeight: 700,
              lineHeight: 1.28,
              letterSpacing: "-.025em",
              textShadow: "0 3px 24px rgba(0,0,0,.28)",
            }}
          >
            แจ้งเหตุไว ส่งต่อทีมช่างได้ตรงจุด
          </Typography>
          <Typography
            sx={{
              maxWidth: 530,
              color: "rgba(255,255,255,.88)",
              fontSize: { md: ".98rem", lg: "1.08rem" },
              lineHeight: 1.8,
            }}
          >
            รายงานปัญหาโครงสร้างและงานซ่อมบำรุง ติดตามสถานะ
            และประสานงานผู้รับผิดชอบได้ในระบบเดียว
          </Typography>
        </Stack>
      </Box>

      <Box
        component="main"
        sx={{
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          position: "relative",
          overflow: "hidden",
          px: { xs: 2.5, sm: 6, md: 6, lg: 8 },
          py: { xs: 4, sm: 5, md: 6 },
          bgcolor: { xs: "#F8F7FB", md: "#FFFFFF" },
          "&::before": {
            display: { xs: "block", md: "none" },
            content: '\"\"',
            position: "absolute",
            width: 300,
            height: 300,
            top: -205,
            right: -105,
            borderRadius: "50%",
            background: "#EDE8F6",
          },
        }}
      >
        <Stack
          spacing={{ xs: 3, sm: 3.5 }}
          sx={{ width: "100%", maxWidth: 460, position: "relative" }}
        >
          {children}
        </Stack>
      </Box>
    </Box>
  );
}
