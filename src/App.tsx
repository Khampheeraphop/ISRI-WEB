import { CircularProgress, Stack } from "@mui/material";
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppShell } from "./layout/AppShell";
import { useAuth } from "./hooks/useAuth";
import { RoleRoute } from "./components/auth/RoleRoute";
import {
  clearAuthReturnTo,
  getAuthReturnTo,
} from "./features/auth/authReturnTo";

const DashboardPage = lazy(() =>
  import("./pages/DashboardPage").then((module) => ({
    default: module.DashboardPage,
  })),
);
const IncidentReportPage = lazy(() =>
  import("./pages/IncidentReportPage").then((module) => ({
    default: module.IncidentReportPage,
  })),
);
const IncidentDetailPage = lazy(() =>
  import("./pages/IncidentDetailPage").then((module) => ({
    default: module.IncidentDetailPage,
  })),
);
const MyIncidentsPage = lazy(() =>
  import("./pages/MyIncidentsPage").then((module) => ({
    default: module.MyIncidentsPage,
  })),
);
const SlaConfigPage = lazy(() =>
  import("./features/sla/SlaConfigPage").then((module) => ({
    default: module.SlaConfigPage,
  })),
);
const TechnicianWorkOrdersPage = lazy(() =>
  import("./features/workOrders/TechnicianWorkOrdersPage").then((module) => ({
    default: module.TechnicianWorkOrdersPage,
  })),
);
const WorkOrderDetailPage = lazy(() =>
  import("./features/workOrders/WorkOrderDetailPage").then((module) => ({
    default: module.WorkOrderDetailPage,
  })),
);
const RewardCatalogAdminPage = lazy(() =>
  import("./features/rewards/RewardCatalogAdminPage").then((module) => ({
    default: module.RewardCatalogAdminPage,
  })),
);
const RewardWalletPage = lazy(() =>
  import("./features/rewards/RewardWalletPage").then((module) => ({
    default: module.RewardWalletPage,
  })),
);
const RewardCatalogFormPage = lazy(() =>
  import("./features/rewards/RewardCatalogFormPage").then((module) => ({
    default: module.RewardCatalogFormPage,
  })),
);
const CampaignAdminPage = lazy(() =>
  import("./features/campaigns/CampaignAdminPage").then((module) => ({
    default: module.CampaignAdminPage,
  })),
);
const CampaignFormPage = lazy(() =>
  import("./features/campaigns/CampaignFormPage").then((module) => ({
    default: module.CampaignFormPage,
  })),
);
const CampaignLeaderboardPage = lazy(() =>
  import("./features/campaigns/CampaignLeaderboardPage").then((module) => ({
    default: module.CampaignLeaderboardPage,
  })),
);
const PMSchedulesPage = lazy(() =>
  import("./features/pm/PMSchedulesPage").then((module) => ({
    default: module.PMSchedulesPage,
  })),
);
const PMScheduleFormPage = lazy(() =>
  import("./features/pm/PMScheduleFormPage").then((module) => ({
    default: module.PMScheduleFormPage,
  })),
);
const PMCompletePage = lazy(() =>
  import("./features/pm/PMCompletePage").then((module) => ({
    default: module.PMCompletePage,
  })),
);
const UserManagementPage = lazy(() =>
  import("./features/admin/UserManagementPage").then((module) => ({
    default: module.UserManagementPage,
  })),
);
const LocationManagementPage = lazy(() =>
  import("./features/admin/LocationManagementPage").then((module) => ({
    default: module.LocationManagementPage,
  })),
);
const LocationFormPage = lazy(() =>
  import("./features/admin/LocationFormPage").then((module) => ({
    default: module.LocationFormPage,
  })),
);
const DispatchQueuePage = lazy(() =>
  import("./features/dispatch/DispatchQueuePage").then((module) => ({
    default: module.DispatchQueuePage,
  })),
);
const DispatchIncidentDetailPage = lazy(() =>
  import("./features/dispatch/DispatchIncidentDetailPage").then((module) => ({
    default: module.DispatchIncidentDetailPage,
  })),
);
const LoginPage = lazy(() =>
  import("./features/auth/LoginPage").then((module) => ({
    default: module.LoginPage,
  })),
);
const AuthCallbackPage = lazy(() =>
  import("./features/auth/AuthCallbackPage").then((module) => ({
    default: module.AuthCallbackPage,
  })),
);
const OnboardingPage = lazy(() =>
  import("./features/auth/OnboardingPage").then((module) => ({
    default: module.OnboardingPage,
  })),
);

function PageLoading() {
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
}

function ApplicationRoutes() {
  return (
    <AppShell>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route
            path="/"
            element={
              <RoleRoute roles={["admin"]}>
                <DashboardPage />
              </RoleRoute>
            }
          />
          <Route
            path="/incidents/new"
            element={
              <RoleRoute roles={["reporter"]}>
                <IncidentReportPage />
              </RoleRoute>
            }
          />
          <Route
            path="/incidents/mine"
            element={
              <RoleRoute roles={["reporter"]}>
                <MyIncidentsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/incidents/:id"
            element={
              <RoleRoute roles={["reporter"]}>
                <IncidentDetailPage />
              </RoleRoute>
            }
          />
          <Route
            path="/rewards"
            element={
              <RoleRoute roles={["reporter"]}>
                <RewardWalletPage />
              </RoleRoute>
            }
          />
          <Route
            path="/rewards/manage"
            element={
              <RoleRoute roles={["admin"]}>
                <RewardCatalogAdminPage />
              </RoleRoute>
            }
          />
          <Route
            path="/rewards/manage/:id"
            element={
              <RoleRoute roles={["admin"]}>
                <RewardCatalogFormPage />
              </RoleRoute>
            }
          />
          <Route
            path="/campaigns"
            element={
              <RoleRoute roles={["admin"]}>
                <CampaignLeaderboardPage />
              </RoleRoute>
            }
          />
          <Route
            path="/campaigns/manage"
            element={
              <RoleRoute roles={["admin"]}>
                <CampaignAdminPage />
              </RoleRoute>
            }
          />
          <Route
            path="/campaigns/manage/:id"
            element={
              <RoleRoute roles={["admin"]}>
                <CampaignFormPage />
              </RoleRoute>
            }
          />
          <Route
            path="/pm"
            element={
              <RoleRoute roles={["technician", "admin"]}>
                <PMSchedulesPage />
              </RoleRoute>
            }
          />
          <Route
            path="/pm/new"
            element={
              <RoleRoute roles={["admin"]}>
                <PMScheduleFormPage />
              </RoleRoute>
            }
          />
          <Route
            path="/pm/:id/edit"
            element={
              <RoleRoute roles={["admin"]}>
                <PMScheduleFormPage />
              </RoleRoute>
            }
          />
          <Route
            path="/pm/:id/complete"
            element={
              <RoleRoute roles={["technician"]}>
                <PMCompletePage />
              </RoleRoute>
            }
          />
          <Route
            path="/work-orders"
            element={
              <RoleRoute roles={["technician"]}>
                <TechnicianWorkOrdersPage />
              </RoleRoute>
            }
          />
          <Route
            path="/work-orders/:id"
            element={
              <RoleRoute roles={["technician", "dispatcher", "admin"]}>
                <WorkOrderDetailPage />
              </RoleRoute>
            }
          />
          <Route
            path="/sla"
            element={
              <RoleRoute roles={["admin"]}>
                <SlaConfigPage />
              </RoleRoute>
            }
          />
          <Route
            path="/users"
            element={
              <RoleRoute roles={["admin"]}>
                <UserManagementPage />
              </RoleRoute>
            }
          />
          <Route
            path="/locations"
            element={
              <RoleRoute roles={["admin"]}>
                <LocationManagementPage />
              </RoleRoute>
            }
          />
          <Route
            path="/locations/new"
            element={
              <RoleRoute roles={["admin"]}>
                <LocationFormPage />
              </RoleRoute>
            }
          />
          <Route
            path="/locations/:id"
            element={
              <RoleRoute roles={["admin"]}>
                <LocationFormPage />
              </RoleRoute>
            }
          />
          <Route
            path="/dispatch"
            element={
              <RoleRoute roles={["dispatcher", "admin"]}>
                <DispatchQueuePage />
              </RoleRoute>
            }
          />
          <Route
            path="/dispatch/incidents/:id"
            element={
              <RoleRoute roles={["dispatcher", "admin"]}>
                <DispatchIncidentDetailPage />
              </RoleRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppShell>
  );
}

function ProtectedApplication() {
  const { authUser, profile, user, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <PageLoading />;
  if (!authUser)
    return (
      <Navigate
        to={`/login?returnTo=${encodeURIComponent(`${location.pathname}${location.search}`)}`}
        replace
      />
    );
  if (!profile || !user) return <Navigate to="/onboarding" replace />;
  const returnTo = getAuthReturnTo();
  const currentPath = `${location.pathname}${location.search}`;
  if (returnTo && returnTo !== currentPath)
    return <Navigate to={returnTo} replace />;
  if (returnTo === currentPath) clearAuthReturnTo();
  return <ApplicationRoutes />;
}

export default function App() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="*" element={<ProtectedApplication />} />
      </Routes>
    </Suspense>
  );
}
