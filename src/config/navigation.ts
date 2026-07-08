import {
  Battery,
  CircuitBoard,
  Cpu,
  FileText,
  HardDrive,
  LayoutDashboard,
  MemoryStick,
  Monitor,
  MonitorCog,
  Network,
  Settings,
  ShieldCheck,
  Thermometer,
  KeyRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  /** i18n key under the "Navigation" namespace. */
  key: string;
  path: string;
  icon: LucideIcon;
}

export interface NavGroup {
  /** i18n key under the "Navigation" namespace, e.g. "groups.hardware". */
  key: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    key: "groups.system",
    items: [
      { key: "overview", path: "/app/overview", icon: LayoutDashboard },
    ],
  },
  {
    key: "groups.hardware",
    items: [
      { key: "cpu", path: "/app/cpu", icon: Cpu },
      { key: "gpu", path: "/app/gpu", icon: MonitorCog },
      { key: "memory", path: "/app/memory", icon: MemoryStick },
      { key: "storage", path: "/app/storage", icon: HardDrive },
      { key: "displays", path: "/app/displays", icon: Monitor },
      { key: "network", path: "/app/network", icon: Network },
      { key: "battery", path: "/app/battery", icon: Battery },
      { key: "mainboard", path: "/app/mainboard", icon: CircuitBoard },
    ],
  },
  {
    key: "groups.status",
    items: [
      { key: "security", path: "/app/security", icon: ShieldCheck },
      { key: "license", path: "/app/license", icon: KeyRound },
      { key: "sensors", path: "/app/sensors", icon: Thermometer },
    ],
  },
];

export const secondaryNavItems: NavItem[] = [
  { key: "report", path: "/app/report", icon: FileText },
  { key: "settings", path: "/app/settings", icon: Settings },
];

export const allNavItems: NavItem[] = [
  ...navGroups.flatMap((g) => g.items),
  ...secondaryNavItems,
];
