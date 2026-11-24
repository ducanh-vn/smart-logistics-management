import type { ModuleKey } from "@/types/auth";
import { vi } from "./i18n/vi";

export interface NavItem {
  href: string;
  label: string;
  module: ModuleKey;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: vi.nav.dashboard, module: "reports" },
  { href: "/orders", label: vi.nav.orders, module: "orders" },
  { href: "/warehouse", label: vi.nav.warehouse, module: "warehouse" },
  { href: "/fleet", label: vi.nav.fleet, module: "fleet" },
  { href: "/dispatch", label: vi.nav.dispatch, module: "dispatch" },
  { href: "/reports", label: vi.nav.reports, module: "reports" },
  { href: "/admin", label: vi.nav.admin, module: "admin" },
];
