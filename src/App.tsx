import { CircularProgress, Stack } from "@mui/material";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppShell } from "./layout/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { IncidentReportPage } from "./pages/IncidentReportPage";
import { IncidentDetailPage } from "./pages/IncidentDetailPage";
import { MyIncidentsPage } from "./pages/MyIncidentsPage";
import { SlaConfigPage } from "./features/sla/SlaConfigPage";
import { TechnicianWorkOrdersPage } from "./features/workOrders/TechnicianWorkOrdersPage";
import { WorkOrderDetailPage } from "./features/workOrders/WorkOrderDetailPage";
import { RewardCatalogAdminPage } from "./features/rewards/RewardCatalogAdminPage";
import { RewardWalletPage } from "./features/rewards/RewardWalletPage";
import { RewardCatalogFormPage } from "./features/rewards/RewardCatalogFormPage";
import { CampaignAdminPage } from "./features/campaigns/CampaignAdminPage";
import { CampaignFormPage } from "./features/campaigns/CampaignFormPage";
import { CampaignLeaderboardPage } from "./features/campaigns/CampaignLeaderboardPage";
import { PMSchedulesPage } from "./features/pm/PMSchedulesPage";
import { PMScheduleFormPage } from "./features/pm/PMScheduleFormPage";
import { PMCompletePage } from "./features/pm/PMCompletePage";
import { UserManagementPage } from "./features/admin/UserManagementPage";
import { LocationManagementPage } from "./features/admin/LocationManagementPage";
import { LocationFormPage } from "./features/admin/LocationFormPage";
import { DispatchQueuePage } from "./features/dispatch/DispatchQueuePage";
import { LoginPage } from "./features/auth/LoginPage";
import { AuthCallbackPage } from "./features/auth/AuthCallbackPage";
import { OnboardingPage } from "./features/auth/OnboardingPage";
import { useAuth } from "./hooks/useAuth";

function ApplicationRoutes() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/incidents/new" element={<IncidentReportPage />} />
        <Route path="/incidents/mine" element={<MyIncidentsPage />} />
        <Route path="/incidents/:id" element={<IncidentDetailPage />} />
        <Route path="/rewards" element={<RewardWalletPage />} />
        <Route path="/rewards/manage" element={<RewardCatalogAdminPage />} />
        <Route path="/rewards/manage/:id" element={<RewardCatalogFormPage />} />
        <Route path="/campaigns" element={<CampaignLeaderboardPage />} />
        <Route path="/campaigns/manage" element={<CampaignAdminPage />} />
        <Route path="/campaigns/manage/:id" element={<CampaignFormPage />} />
        <Route path="/pm" element={<PMSchedulesPage />} />
        <Route path="/pm/new" element={<PMScheduleFormPage />} />
        <Route path="/pm/:id/edit" element={<PMScheduleFormPage />} />
        <Route path="/pm/:id/complete" element={<PMCompletePage />} />
        <Route path="/work-orders" element={<TechnicianWorkOrdersPage />} />
        <Route path="/work-orders/:id" element={<WorkOrderDetailPage />} />
        <Route path="/sla" element={<SlaConfigPage />} />
        <Route path="/users" element={<UserManagementPage />} />
        <Route path="/locations" element={<LocationManagementPage />} />
        <Route path="/locations/new" element={<LocationFormPage />} />
        <Route path="/locations/:id" element={<LocationFormPage />} />
        <Route path="/dispatch" element={<DispatchQueuePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

function ProtectedApplication() {
  const { authUser, profile, user, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading)
    return (
      <Stack
        sx={{
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Stack>
    );
  if (!authUser)
    return (
      <Navigate
        to={`/login?returnTo=${encodeURIComponent(`${location.pathname}${location.search}`)}`}
        replace
      />
    );
  if (!profile || !user) return <Navigate to="/onboarding" replace />;
  return <ApplicationRoutes />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="*" element={<ProtectedApplication />} />
    </Routes>
  );
}
