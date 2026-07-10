import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getPlatformInfo } from "@/lib/tauri";
import { usePlatformStore } from "@/stores/platform-store";

export function DashboardLayout() {
  const { platform, setPlatform } = usePlatformStore();

  // The welcome screen normally fills the store, but a direct reload into
  // /app skips it — fetch here so platform-gated nav items still appear.
  useEffect(() => {
    if (platform) {
      return;
    }
    getPlatformInfo()
      .then(setPlatform)
      .catch(() => {
        // invoke unavailable (plain browser); platform-gated items stay hidden
      });
  }, [platform, setPlatform]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0 overflow-hidden">
        <AppHeader />
        <main className="flex min-w-0 flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto overscroll-contain p-4 lg:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
