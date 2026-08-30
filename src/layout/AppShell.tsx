import {
  AccountCircleOutlined,
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
  Badge,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
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
const menus: Record<Role, { label: string; to: string; icon: ReactNode }[]> = {
  reporter: [
    {
      label: "รายการแจ้งซ่อมของฉัน",
      to: "/incidents/mine",
      icon: <AssignmentOutlined />,
    },
    { label: "แต้มและรางวัล", to: "/rewards", icon: <EmojiEventsOutlined /> },
  ],
  technician: [
    { label: "งานของฉัน", to: "/work-orders", icon: <EngineeringOutlined /> },
    {
      label: "ประวัติการดำเนินงาน",
      to: "/work-orders/history",
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
      to: "/dispatch/history",
      icon: <HistoryOutlined />,
    },
  ],
  admin: [
    { label: "ภาพรวม", to: "/", icon: <DashboardOutlined /> },
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
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountAnchor, setAccountAnchor] = useState<HTMLElement | null>(null);
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
  if (!user) return null;
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
            <Badge
              badgeContent={
                (notifications.data ?? []).filter((item) => !item.is_read)
                  .length
              }
              color="error"
            >
              <NotificationsOutlined />
            </Badge>
          </IconButton>
          <Button
            color="inherit"
            onClick={(event) => setAccountAnchor(event.currentTarget)}
            startIcon={<AccountCircleOutlined color="primary" />}
            sx={{ textTransform: "none", textAlign: "left", py: 0.5 }}
          >
            <Box>
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
          </Button>
          <Menu
            anchorEl={accountAnchor}
            open={Boolean(accountAnchor)}
            onClose={() => setAccountAnchor(null)}
          >
            <MenuItem onClick={() => void signOut()}>
              <ListItemIcon>
                <LogoutOutlined fontSize="small" />
              </ListItemIcon>
              ออกจากระบบ
            </MenuItem>
          </Menu>
          <Menu
            anchorEl={notificationAnchor}
            open={Boolean(notificationAnchor)}
            onClose={() => setNotificationAnchor(null)}
            slotProps={{
              paper: { sx: { width: 360, maxWidth: "calc(100vw - 24px)" } },
            }}
          >
            {(notifications.data ?? []).length ? (
              (notifications.data ?? []).map((item) => (
                <MenuItem
                  key={item.id}
                  onClick={() => {
                    if (!item.is_read) markRead.mutate(item.id);
                    setNotificationAnchor(null);
                    if (user.role === "reporter" && item.related_incident_id)
                      navigate(`/incidents/${item.related_incident_id}`);
                    else if (user.role === "technician")
                      navigate("/work-orders");
                    else navigate("/dispatch");
                  }}
                  sx={{
                    whiteSpace: "normal",
                    alignItems: "flex-start",
                    py: 1.25,
                    bgcolor: item.is_read
                      ? "transparent"
                      : "rgba(75,59,134,.06)",
                  }}
                >
                  {item.message}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>ไม่มีการแจ้งเตือนใหม่</MenuItem>
            )}
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
