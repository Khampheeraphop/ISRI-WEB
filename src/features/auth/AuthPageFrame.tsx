import AutoAwesomeOutlined from "@mui/icons-material/AutoAwesomeOutlined";
import { Box, Stack, Typography } from "@mui/material";
import type { PropsWithChildren } from "react";

export function AuthPageFrame({ children }: PropsWithChildren) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "minmax(0, 1.12fr) minmax(480px, .88fr)",
        },
        bgcolor: "#fff",
      }}
    >
      <Box
        component="section"
        aria-label="พยาบาลแจ้งปัญหาและช่างโรงพยาบาลเข้าตรวจสอบ"
        sx={{
          display: { xs: "none", md: "flex" },
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
          flexDirection: "column",
          justifyContent: "space-between",
          p: { md: 5, lg: 7 },
          color: "common.white",
          backgroundImage:
            "linear-gradient(180deg, rgba(11,18,55,.32) 0%, rgba(11,18,55,.12) 38%, rgba(9,13,42,.92) 100%), url('/images/isri-login-hospital-hero-v2.png')",
          backgroundSize: "cover",
          backgroundPosition: "center 42%",
          "&::after": {
            content: '""',
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(71,55,139,.20), transparent 45%)",
            pointerEvents: "none",
          },
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ position: "relative", zIndex: 1, alignItems: "center" }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              display: "grid",
              placeItems: "center",
              borderRadius: 2.5,
              bgcolor: "rgba(255,255,255,.14)",
              border: "1px solid rgba(255,255,255,.28)",
              backdropFilter: "blur(14px)",
            }}
          >
            <AutoAwesomeOutlined />
          </Box>
          <Box>
            <Typography
              variant="h4"
              sx={{ lineHeight: 1.1, letterSpacing: ".04em" }}
            >
              ISRI
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,.76)" }}
            >
              HOSPITAL INCIDENT REPORTING
            </Typography>
          </Box>
        </Stack>

        <Stack
          spacing={2}
          sx={{ position: "relative", zIndex: 1, maxWidth: 590 }}
        >
          <Box
            sx={{
              width: 54,
              height: 4,
              borderRadius: 99,
              background: "linear-gradient(90deg, #F4BC67, #fff)",
            }}
          />
          <Typography
            component="h1"
            sx={{
              fontSize: { md: "2.4rem", lg: "3.15rem" },
              fontWeight: 700,
              lineHeight: 1.25,
              textShadow: "0 3px 22px rgba(0,0,0,.24)",
            }}
          >
            พบปัญหาในโรงพยาบาล
            <br />
            แจ้งได้ทันที
          </Typography>
          <Typography
            sx={{
              maxWidth: 520,
              color: "rgba(255,255,255,.82)",
              fontSize: { md: "1rem", lg: "1.1rem" },
              lineHeight: 1.8,
            }}
          >
            ส่งต่อปัญหาถึงทีมที่รับผิดชอบ ติดตามสถานะ
            และร่วมดูแลโรงพยาบาลให้ปลอดภัยในระบบเดียว
          </Typography>
        </Stack>
      </Box>

      <Box
        component="main"
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          position: "relative",
          overflow: "hidden",
          px: { xs: 2.5, sm: 6, md: 6, lg: 9 },
          py: { xs: 5, md: 6 },
          bgcolor: { xs: "#F8F7FB", md: "#fff" },
          "&::before": {
            display: { xs: "block", md: "none" },
            content: '""',
            position: "absolute",
            width: 320,
            height: 320,
            top: -180,
            right: -120,
            borderRadius: "50%",
            background: "rgba(75,59,134,.10)",
          },
        }}
      >
        <Stack
          spacing={3.5}
          sx={{ width: "100%", maxWidth: 500, position: "relative" }}
        >
          <Box>
            <Stack
              direction="row"
              spacing={1.25}
              sx={{ alignItems: "center", mb: 1 }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 2,
                  color: "primary.main",
                  bgcolor: "rgba(75,59,134,.09)",
                }}
              >
                <AutoAwesomeOutlined fontSize="small" />
              </Box>
              <Typography
                variant="h4"
                color="primary.main"
                sx={{ letterSpacing: ".04em" }}
              >
                ISRI
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              ระบบแจ้งเหตุและแรงจูงใจ
            </Typography>
          </Box>
          {children}
        </Stack>
      </Box>
    </Box>
  );
}
