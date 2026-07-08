import { useTranslation } from "react-i18next";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BatteryPage } from "@/pages/battery";
import { CpuPage } from "@/pages/cpu";
import { DisplaysPage } from "@/pages/displays";
import { GpuPage } from "@/pages/gpu";
import { MemoryPage } from "@/pages/memory";
import { NetworkPage } from "@/pages/network";
import { OverviewPage } from "@/pages/overview";
import { PlaceholderPage } from "@/pages/placeholder";
import { SettingsPage } from "@/pages/settings";
import { StoragePage } from "@/pages/storage";
import { WelcomePage } from "@/pages/welcome";
import { ThemeProvider } from "@/providers/theme-provider";

const placeholderKeys = [
  "mainboard",
  "security",
  "license",
  "sensors",
  "report",
] as const;

function App() {
  const { t } = useTranslation("Navigation");

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
              {placeholderKeys.map((key) => (
                <Route
                  element={<PlaceholderPage title={t(key)} />}
                  key={key}
                  path={key}
                />
              ))}
              <Route element={<SettingsPage />} path="settings" />
            </Route>
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
