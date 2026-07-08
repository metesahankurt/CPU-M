import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { allNavItems } from "@/config/navigation";

export function AppHeader() {
  const { t } = useTranslation("Navigation");
  const { pathname } = useLocation();
  const current = allNavItems.find((item) => item.path === pathname);

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          className="mx-2 data-[orientation=vertical]:h-4"
          orientation="vertical"
        />
        <span className="font-medium text-sm">
          {current ? t(current.key) : "CPU-M"}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <LanguageToggle />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
