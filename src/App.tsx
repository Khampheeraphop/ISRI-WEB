import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./layout/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route
          path="/incidents/new"
          element={
            <PlaceholderPage
              title="แจ้งเหตุ"
              description="เตรียมไว้สำหรับ Sprint 1"
            />
          }
        />
        <Route
          path="/incidents/mine"
          element={
            <PlaceholderPage
              title="เรื่องที่ฉันแจ้ง"
              description="เตรียมไว้สำหรับ Sprint 1"
            />
          }
        />
        <Route
          path="/rewards"
          element={
            <PlaceholderPage
              title="แต้มและรางวัล"
              description="เตรียมไว้สำหรับ Sprint 3"
            />
          }
        />
        <Route
          path="/work-orders"
          element={
            <PlaceholderPage
              title="งานของฉัน"
              description="เตรียมไว้สำหรับ Sprint 2"
            />
          }
        />
        <Route
          path="/sla"
          element={
            <PlaceholderPage
              title="ตั้งค่า SLA"
              description="เตรียมไว้สำหรับ Sprint 2"
            />
          }
        />
        <Route path="/users" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

export default App;
