import {
  AccountCircleOutlined,
  CloseOutlined,
  NotificationsOutlined,
  AdminPanelSettingsOutlined,
  AssignmentOutlined,
  CardGiftcardOutlined,
  DashboardOutlined,
  EmojiEventsOutlined,
  EngineeringOutlined,
  FactCheckOutlined,
  HistoryOutlined,
  AssignmentIndOutlined,
  LogoutOutlined,
  Menu as MenuIcon,
  SettingsOutlined,
} from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { Role } from "../types/user";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../features/notifications/notificationsApi";
import { supabase } from "../lib/supabase/client";

const drawerWidth = 252;
const roleLabels: Record<Role, string> = {
  reporter: "ผู้แจ้งเหตุ",
  technician: "ช่างซ่อมบำรุง",
  dispatcher: "ผู้จัดสรรงาน",
  admin: "ผู้ดูแลระบบ",
};

function normalizeAvatarUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const rawValue = value.trim();
  const markdownLink = rawValue.match(
    /^\[(https?:\/\/[^\]]+)]\((https?:\/\/[^)]+)\)$/,
  );
  const candidate = markdownLink?.[2] ?? rawValue;

  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
    if (url.hostname === "lh3.googleusercontent.com") {
      url.pathname = url.pathname.replace(/=s\d+-c$/, "=s256-c");
    }
    return url.toString();
  } catch {
    return undefined;
  }
}

function getGoogleAvatarUrl(authUser: ReturnType<typeof useAuth>["authUser"]) {
  const googleIdentity = authUser?.identities?.find(
    (identity) => identity.provider === "google",
  );
  const identityData = googleIdentity?.identity_data;

  return [
    authUser?.user_metadata.avatar_url,
    authUser?.user_metadata.picture,
    identityData?.avatar_url,
    identityData?.picture,
  ]
    .map(normalizeAvatarUrl)
    .find((value): value is string => Boolean(value));
}
const menus: Record<Role, { label: string; to: string; icon: ReactNode }[]> = {
  reporter: [
    {
      label: "รายการแจ้งซ่อมของฉัน",
      to: "/incidents/mine",
      icon: <AssignmentOutlined />,
    },
    {
      label: "ประวัติการดำเนินงาน",
      to: "/activity-history",
      icon: <HistoryOutlined />,
    },
    { label: "แต้มและรางวัล", to: "/rewards", icon: <EmojiEventsOutlined /> },
  ],
  technician: [
    { label: "งานของฉัน", to: "/work-orders", icon: <EngineeringOutlined /> },
    {
      label: "ประวัติการดำเนินงาน",
      to: "/activity-history",
      icon: <HistoryOutlined />,
    },
    { label: "แผน PM", to: "/pm", icon: <SettingsOutlined /> },
  ],
  dispatcher: [
    {
      label: "คิวรอจัดสรรงาน",
      to: "/dispatch",
      icon: <AssignmentIndOutlined />,
    },
    {
      label: "รายการรอพิจารณา",
      to: "/dispatch/reviews",
      icon: <FactCheckOutlined />,
    },
    {
      label: "ประวัติการดำเนินงาน",
      to: "/activity-history",
      icon: <HistoryOutlined />,
    },
  ],
  admin: [
    { label: "ภาพรวม", to: "/", icon: <DashboardOutlined /> },
    {
      label: "ประวัติการดำเนินงาน",
      to: "/activity-history",
      icon: <HistoryOutlined />,
    },
    { label: "ตั้งค่า SLA", to: "/sla", icon: <SettingsOutlined /> },
    { label: "แผน PM", to: "/pm", icon: <SettingsOutlined /> },
    {
      label: "จัดการของรางวัล",
      to: "/rewards/manage",
      icon: <CardGiftcardOutlined />,
    },
    {
      label: "การส่งมอบรางวัล",
      to: "/rewards/redemptions",
      icon: <CardGiftcardOutlined />,
    },
    {
      label: "จัดการแคมเปญ",
      to: "/campaigns/manage",
      icon: <EmojiEventsOutlined />,
    },
    { label: "อันดับแคมเปญ", to: "/campaigns", icon: <EmojiEventsOutlined /> },
    {
      label: "จัดการผู้ใช้",
      to: "/users",
      icon: <AdminPanelSettingsOutlined />,
    },
    { label: "ตำแหน่งและ QR", to: "/locations", icon: <AssignmentOutlined /> },
  ],
};

export function AppShell({ children }: { children: ReactNode }) {
  const { authUser, profile, user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountAnchor, setAccountAnchor] = useState<HTMLElement | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationAnchor, setNotificationAnchor] =
    useState<HTMLElement | null>(null);
  const queryClient = useQueryClient();
  const notifications = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  });
  useEffect(() => {
    const realtimeClient = supabase;
    if (!realtimeClient || !user) return;
    const channel = realtimeClient
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: ["notifications"] });
          void queryClient.invalidateQueries({ queryKey: ["reward-wallet"] });
          void queryClient.invalidateQueries({ queryKey: ["reward-catalog"] });
        },
      )
      .subscribe();
    return () => {
      void realtimeClient.removeChannel(channel);
    };
  }, [queryClient, user]);
  const markRead = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
  const markAllRead = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
  if (!user) return null;
  const avatarUrl = getGoogleAvatarUrl(authUser);
  const initials = user.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const unreadNotifications = (notifications.data ?? []).filter(
    (item) => !item.is_read,
  );
  const navigation = (
    <Box sx={{ height: "100%", bgcolor: "background.paper" }}>
      <Box sx={{ px: 3, py: 3, borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="h4" color="primary.main" sx={{ lineHeight: 1 }}>
          ISRI
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Infrastructure Safety Reporting
          <br />& Incentive System
        </Typography>
      </Box>
      <List sx={{ p: 1.5 }}>
        {menus[user.role].map((item) => (
          <ListItemButton
            key={item.to}
            component={Link}
            to={item.to}
            selected={location.pathname === item.to}
            onClick={() => setMobileOpen(false)}
            sx={{ mb: 0.5, borderRadius: 1.5 }}
          >
            <ListItemIcon
              sx={{
                minWidth: 38,
                color:
                  location.pathname === item.to
                    ? "primary.main"
                    : "text.secondary",
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "rgba(255,255,255,.95)",
        }}
      >
        <Toolbar
          sx={{ justifyContent: "space-between", minHeight: "70px !important" }}
        >
          <IconButton
            onClick={() => setMobileOpen(true)}
            aria-label="เปิดเมนู"
            sx={{ display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            aria-label="การแจ้งเตือน"
            onClick={(event) => setNotificationAnchor(event.currentTarget)}
          >
            <Badge badgeContent={unreadNotifications.length} color="error">
              <NotificationsOutlined />
            </Badge>
          </IconButton>
          <Button
            color="inherit"
            onClick={(event) => setAccountAnchor(event.currentTarget)}
            aria-haspopup="menu"
            aria-expanded={Boolean(accountAnchor)}
            sx={{
              ml: 0.75,
              textTransform: "none",
              textAlign: "right",
              py: 0.5,
              px: { xs: 0.75, sm: 1.25 },
              borderRadius: 2.5,
              "&:hover": { bgcolor: "rgba(75,59,134,.06)" },
            }}
          >
            <Box sx={{ display: { xs: "none", sm: "block" }, mr: 1.25 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, lineHeight: 1.2 }}
              >
                {user.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {roleLabels[user.role]}
              </Typography>
            </Box>
            <Avatar
              src={avatarUrl}
              alt={user.name}
              slotProps={{ img: { referrerPolicy: "no-referrer" } }}
              sx={{
                width: 42,
                height: 42,
                fontSize: ".9rem",
                fontWeight: 700,
                color: "primary.main",
                bgcolor: "rgba(75,59,134,.12)",
                border: "2px solid #fff",
                boxShadow: "0 0 0 1px #DCD7E9, 0 4px 12px rgba(45,32,90,.12)",
              }}
            >
              {initials}
            </Avatar>
          </Button>
          <Menu
            anchorEl={accountAnchor}
            open={Boolean(accountAnchor)}
            onClose={() => setAccountAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slotProps={{
              paper: {
                sx: {
                  mt: 1,
                  minWidth: 210,
                  p: 0.75,
                  borderRadius: 2,
                  boxShadow: "0 14px 40px rgba(31,27,46,.14)",
                },
              },
            }}
          >
            <MenuItem
              onClick={() => {
                setAccountAnchor(null);
                setProfileOpen(true);
              }}
              sx={{ borderRadius: 1.5, py: 1.15 }}
            >
              <ListItemIcon>
                <AccountCircleOutlined fontSize="small" />
              </ListItemIcon>
              ดูโปรไฟล์
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem
              onClick={() => {
                setAccountAnchor(null);
                void signOut();
              }}
              sx={{ borderRadius: 1.5, py: 1.15, color: "error.main" }}
            >
              <ListItemIcon>
                <LogoutOutlined fontSize="small" color="error" />
              </ListItemIcon>
              ออกจากระบบ
            </MenuItem>
          </Menu>
          <Dialog
            open={profileOpen}
            onClose={() => setProfileOpen(false)}
            fullWidth
            maxWidth="md"
            slotProps={{
              paper: {
                sx: {
                  overflowX: "hidden",
                  overflowY: { xs: "auto", sm: "hidden" },
                  maxHeight: { xs: "calc(100dvh - 24px)", sm: "none" },
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "minmax(0, 1fr)",
                    sm: "290px minmax(0, 1fr)",
                  },
                  gridTemplateRows: { xs: "auto auto auto", sm: "1fr auto" },
                  width: { xs: "calc(100% - 24px)", sm: 780 },
                  maxWidth: "calc(100% - 24px)",
                  m: { xs: 1.5, sm: 3 },
                  borderRadius: { xs: 2.5, sm: 3.5 },
                  boxShadow: "0 24px 80px rgba(31,27,46,.22)",
                },
              },
            }}
          >
            <DialogTitle
              component="div"
              sx={{
                position: "relative",
                gridColumn: 1,
                gridRow: { xs: 1, sm: "1 / 3" },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                p: { xs: 2.5, sm: 4 },
                minHeight: { xs: 188, sm: 430 },
                color: "common.white",
                background:
                  "linear-gradient(155deg, #332667 0%, #51408F 54%, #735FAD 100%)",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  width: 220,
                  height: 220,
                  borderRadius: "50%",
                  top: -120,
                  left: -100,
                  border: "44px solid rgba(255,255,255,.055)",
                },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  width: 150,
                  height: 150,
                  borderRadius: "50%",
                  right: -75,
                  bottom: -70,
                  bgcolor: "rgba(255,255,255,.055)",
                },
              }}
            >
              <IconButton
                aria-label="ปิด"
                onClick={() => setProfileOpen(false)}
                sx={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  zIndex: 2,
                  display: { xs: "inline-flex", sm: "none" },
                  color: "rgba(255,255,255,.82)",
                  bgcolor: "rgba(255,255,255,.1)",
                }}
              >
                <CloseOutlined />
              </IconButton>
              <Stack
                sx={{ position: "relative", zIndex: 1, alignItems: "center" }}
              >
                <Avatar
                  src={avatarUrl}
                  alt={user.name}
                  slotProps={{ img: { referrerPolicy: "no-referrer" } }}
                  sx={{
                    width: { xs: 104, sm: 156 },
                    height: { xs: 104, sm: 156 },
                    fontSize: "2.2rem",
                    fontWeight: 700,
                    color: "primary.main",
                    bgcolor: "#F2EFFA",
                    border: {
                      xs: "4px solid rgba(255,255,255,.94)",
                      sm: "6px solid rgba(255,255,255,.94)",
                    },
                    boxShadow: "0 16px 38px rgba(16,10,44,.3)",
                  }}
                >
                  {initials}
                </Avatar>
              </Stack>
            </DialogTitle>
            <Box
              sx={{
                gridColumn: { xs: 1, sm: 2 },
                gridRow: { xs: 2, sm: 1 },
                position: "relative",
                px: { xs: 2.5, sm: 4 },
                pb: { xs: 1.5, sm: 4 },
                pt: { xs: 2.5, sm: 8 },
              }}
            >
              <IconButton
                aria-label="ปิด"
                onClick={() => setProfileOpen(false)}
                sx={{
                  position: "absolute",
                  top: 14,
                  right: 14,
                  display: { xs: "none", sm: "inline-flex" },
                  color: "text.secondary",
                }}
              >
                <CloseOutlined />
              </IconButton>
              <Box sx={{ pr: { sm: 5 }, mb: { xs: 2, sm: 3 } }}>
                <Typography variant="h4">โปรไฟล์ของฉัน</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  รายละเอียดบัญชีผู้ใช้งาน
                </Typography>
              </Box>
              <Stack spacing={{ xs: 1.5, sm: 2.25 }}>
                <Box
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: 2,
                    border: 1,
                    borderColor: "divider",
                    bgcolor: "#FCFBFE",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    ชื่อ–นามสกุล
                  </Typography>
                  <Typography sx={{ fontWeight: 600, mt: 0.35 }}>
                    {user.name}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: 2,
                    border: 1,
                    borderColor: "divider",
                    bgcolor: "#FCFBFE",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    อีเมล
                  </Typography>
                  <Typography
                    sx={{ fontWeight: 600, mt: 0.35, wordBreak: "break-word" }}
                  >
                    {profile?.email ?? authUser?.email ?? "—"}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: 2,
                      bgcolor: "rgba(75,59,134,.065)",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      สิทธิ์การใช้งาน
                    </Typography>
                    <Typography sx={{ fontWeight: 600, mt: 0.35 }}>
                      {roleLabels[user.role]}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: 2,
                      bgcolor: "rgba(59,143,109,.08)",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      สถานะบัญชี
                    </Typography>
                    <Typography
                      color="success.main"
                      sx={{ fontWeight: 600, mt: 0.35 }}
                    >
                      ยืนยันแล้ว
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Box>
            <DialogActions
              sx={{
                gridColumn: { xs: 1, sm: 2 },
                gridRow: { xs: 3, sm: 2 },
                px: { xs: 2.5, sm: 4 },
                pb: { xs: 2.5, sm: 4 },
                pt: 0,
              }}
            >
              <Button
                variant="contained"
                onClick={() => setProfileOpen(false)}
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  minWidth: 120,
                  minHeight: 44,
                  borderRadius: 2,
                }}
              >
                ปิด
              </Button>
            </DialogActions>
          </Dialog>
          <Menu
            anchorEl={notificationAnchor}
            open={Boolean(notificationAnchor)}
            onClose={() => setNotificationAnchor(null)}
            slotProps={{
              paper: {
                sx: {
                  width: 390,
                  maxWidth: "calc(100vw - 24px)",
                  p: 1.25,
                },
              },
            }}
          >
            <Stack spacing={1}>
              <Stack
                direction="row"
                sx={{
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 0.5,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  การแจ้งเตือน
                </Typography>
                <Button
                  size="small"
                  disabled={
                    !unreadNotifications.length || markAllRead.isPending
                  }
                  onClick={() => markAllRead.mutate()}
                >
                  อ่านทั้งหมด
                </Button>
              </Stack>
              {unreadNotifications.length ? (
                unreadNotifications.map((item) => {
                  // Determine target path based on notification type
                  let targetPath = item.target_path;
                  if (!targetPath) {
                    if (
                      item.type?.startsWith("pm_") ||
                      item.related_pm_schedule_id
                    ) {
                      targetPath = "/pm/schedules";
                    } else if (item.related_incident_id) {
                      targetPath = `/incidents/${item.related_incident_id}`;
                    }
                  }

                  return (
                    <MenuItem
                      key={item.id}
                      onClick={async () => {
                        await markRead.mutateAsync(item.id);
                        setNotificationAnchor(null);
                        if (targetPath) navigate(targetPath);
                      }}
                      sx={{
                        whiteSpace: "normal",
                        alignItems: "flex-start",
                        py: 1.25,
                        px: 1.5,
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 1.5,
                        bgcolor: "background.paper",
                      }}
                    >
                      {item.message}
                    </MenuItem>
                  );
                })
              ) : (
                <Box sx={{ px: 1.5, py: 2, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    ไม่มีการแจ้งเตือนใหม่
                  </Typography>
                </Box>
              )}
            </Stack>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { width: drawerWidth },
          }}
        >
          {navigation}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              position: "fixed",
            },
          }}
        >
          {navigation}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          bgcolor: "background.default",
          px: { xs: 2, sm: 3, lg: 4 },
          py: 4,
          mt: "70px",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
