import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./layout/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { IncidentReportPage } from "./pages/IncidentReportPage";
import { MyIncidentsPage } from "./pages/MyIncidentsPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { SlaConfigPage } from "./features/sla/SlaConfigPage";
import { TechnicianWorkOrdersPage } from "./features/workOrders/TechnicianWorkOrdersPage";

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/incidents/new" element={<IncidentReportPage />} />
        <Route path="/incidents/mine" element={<MyIncidentsPage />} />
        <Route path="/rewards" element={<PlaceholderPage title="แต้มและรางวัล" description="เตรียมไว้สำหรับ Sprint 3" />} />
        <Route path="/work-orders" element={<TechnicianWorkOrdersPage />} />
        <Route path="/sla" element={<SlaConfigPage />} />
        <Route path="/users" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

export default App;
