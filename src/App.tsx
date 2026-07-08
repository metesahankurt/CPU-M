import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BatteryPage } from "@/pages/battery";
import { CpuPage } from "@/pages/cpu";
import { DisplaysPage } from "@/pages/displays";
import { GpuPage } from "@/pages/gpu";
import { LicensePage } from "@/pages/license";
import { MainboardPage } from "@/pages/mainboard";
import { MemoryPage } from "@/pages/memory";
import { NetworkPage } from "@/pages/network";
import { OverviewPage } from "@/pages/overview";
import { ReportPage } from "@/pages/report";
import { SettingsPage } from "@/pages/settings";
import { SecurityPage } from "@/pages/security";
import { SensorsPage } from "@/pages/sensors";
import { StoragePage } from "@/pages/storage";
import { WelcomePage } from "@/pages/welcome";
import { ThemeProvider } from "@/providers/theme-provider";

function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <HashRouter>
          <Routes>
            <Route element={<WelcomePage />} path="/" />
            <Route element={<DashboardLayout />} path="/app">
              <Route
                element={<Navigate replace={true} to="/app/overview" />}
                index={true}
              />
              <Route element={<OverviewPage />} path="overview" />
              <Route element={<CpuPage />} path="cpu" />
              <Route element={<GpuPage />} path="gpu" />
              <Route element={<MemoryPage />} path="memory" />
              <Route element={<StoragePage />} path="storage" />
              <Route element={<DisplaysPage />} path="displays" />
              <Route element={<NetworkPage />} path="network" />
              <Route element={<BatteryPage />} path="battery" />
              <Route element={<MainboardPage />} path="mainboard" />
              <Route element={<SecurityPage />} path="security" />
              <Route element={<LicensePage />} path="license" />
              <Route element={<SensorsPage />} path="sensors" />
              <Route element={<ReportPage />} path="report" />
              <Route element={<SettingsPage />} path="settings" />
            </Route>
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
