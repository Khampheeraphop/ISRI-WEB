import {
  AccountCircleOutlined,
  AdminPanelSettingsOutlined,
  AssignmentOutlined,
  CardGiftcardOutlined,
  DashboardOutlined,
  EmojiEventsOutlined,
  EngineeringOutlined,
  Menu as MenuIcon,
  SettingsOutlined,
} from "@mui/icons-material";
import {
  AppBar,
  Box,
  Chip,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Toolbar,
  Typography,
} from "@mui/material";
import { useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEntityQuery } from "../hooks/useEntity";
import type { Role } from "../types/user";

const drawerWidth = 252;
const roleLabels: Record<Role, string> = {
  reporter: "ผู้แจ้งเหตุ",
  technician: "ช่างซ่อมบำรุง",
  admin: "ผู้ดูแลระบบ",
};
const menus: Record<Role, { label: string; to: string; icon: ReactNode }[]> = {
  reporter: [
    { label: "ภาพรวม", to: "/", icon: <DashboardOutlined /> },
    {
      label: "รายการแจ้งซ่อมของฉัน",
      to: "/incidents/mine",
      icon: <AssignmentOutlined />,
    },
    { label: "แต้มและรางวัล", to: "/rewards", icon: <EmojiEventsOutlined /> },
    { label: "อันดับแคมเปญ", to: "/campaigns", icon: <EmojiEventsOutlined /> },
  ],
  technician: [
    { label: "ภาพรวม", to: "/", icon: <DashboardOutlined /> },
    { label: "งานของฉัน", to: "/work-orders", icon: <EngineeringOutlined /> },
    { label: "แผน PM", to: "/pm", icon: <SettingsOutlined /> },
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
  ],
};

export function AppShell({ children }: { children: ReactNode }) {
  const { user, setRole } = useAuth();
  const wallets = useEntityQuery("pointWallets");
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pointBalance =
    (wallets.data ?? []).find((wallet) => wallet.userId === user.id)?.balance ??
    0;
  const navigation = (
    <Box
      sx={{ height: "100%", bgcolor: "background.paper", position: "relative" }}
    >
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
      <Box sx={{ px: 2.5, pb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          เมนูจะแสดงตามมุมมองทดลองที่เลือกด้านบน
        </Typography>
      </Box>
      <Box
        sx={{
          position: "absolute",
          insetInline: 0,
          bottom: 0,
          p: 2.5,
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Prototype • Sprint 3B
        </Typography>
      </Box>
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
          sx={{ justifyContent: "flex-end", minHeight: "70px !important" }}
        >
          <IconButton
            onClick={() => setMobileOpen(true)}
            aria-label="เปิดเมนู"
            sx={{ display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Chip
              label={pointBalance.toLocaleString("th-TH")}
              color="primary"
              variant="outlined"
              sx={{
                height: 36,
                borderRadius: "50%",
                "& .MuiChip-label": { px: 1.1 },
              }}
            />
            <FormControl size="small" sx={{ minWidth: { xs: 136, sm: 190 } }}>
              <InputLabel id="demo-role-label">มุมมองทดลอง</InputLabel>
              <Select
                labelId="demo-role-label"
                label="มุมมองทดลอง"
                value={user.role}
                onChange={(event) => setRole(event.target.value as Role)}
                startAdornment={
                  <AccountCircleOutlined
                    sx={{ mr: 1, color: "primary.main" }}
                  />
                }
              >
                {(Object.keys(roleLabels) as Role[]).map((role) => (
                  <MenuItem key={role} value={role}>
                    {roleLabels[role]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
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
