import { Cpu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { navGroups, secondaryNavItems } from "@/config/navigation";
import { usePlatformStore } from "@/stores/platform-store";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { NavItem } from "@/config/navigation";

function NavItems({ items }: { items: NavItem[] }) {
  const { t } = useTranslation("Navigation");
  const { pathname } = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.key}>
          <SidebarMenuButton
            asChild={true}
            isActive={pathname === item.path}
            tooltip={t(item.key)}
          >
            <Link
              onClick={() => {
                if (isMobile) {
                  setOpenMobile(false);
                }
              }}
              to={item.path}
            >
              <item.icon />
              <span>{t(item.key)}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation("Navigation");
  const platform = usePlatformStore((s) => s.platform);

  // Platform-gated items (and any group left empty) disappear on other OSes.
  const isVisible = (item: NavItem) =>
    !item.windowsOnly || platform?.os === "windows";
  const visibleGroups = navGroups
    .map((group) => ({ ...group, items: group.items.filter(isVisible) }))
    .filter((group) => group.items.length > 0);

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild={true}
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to="/app/overview">
                <Cpu className="!size-5" />
                <span className="font-semibold text-base">CPU-M</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {visibleGroups.map((group) => (
          <SidebarGroup key={group.key}>
            <SidebarGroupLabel>{t(group.key)}</SidebarGroupLabel>
            <SidebarGroupContent>
              <NavItems items={group.items} />
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <NavItems items={secondaryNavItems} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
