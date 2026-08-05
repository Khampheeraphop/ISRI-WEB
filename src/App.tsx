import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./layout/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { IncidentReportPage } from "./pages/IncidentReportPage";
import { MyIncidentsPage } from "./pages/MyIncidentsPage";
import { SlaConfigPage } from "./features/sla/SlaConfigPage";
import { TechnicianWorkOrdersPage } from "./features/workOrders/TechnicianWorkOrdersPage";
import { RewardCatalogAdminPage } from "./features/rewards/RewardCatalogAdminPage";
import { RewardWalletPage } from "./features/rewards/RewardWalletPage";

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/incidents/new" element={<IncidentReportPage />} />
        <Route path="/incidents/mine" element={<MyIncidentsPage />} />
        <Route path="/rewards" element={<RewardWalletPage />} />
        <Route path="/rewards/manage" element={<RewardCatalogAdminPage />} />
        <Route path="/work-orders" element={<TechnicianWorkOrdersPage />} />
        <Route path="/sla" element={<SlaConfigPage />} />
        <Route path="/users" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

export default App;
