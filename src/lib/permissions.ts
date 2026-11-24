import type { Access, ModuleKey, Role } from "@/types/auth";
import { PERMISSIONS } from "@/constants/roles";

const RANK: Record<Access, number> = { NONE: 0, LIMITED: 1, VIEW: 1, FULL: 2 };

/** NFR07 – does the role have at least the required access on the module? */
export const canAccess = (role: Role, module: ModuleKey, need: "VIEW" | "FULL" = "VIEW"): boolean =>
  RANK[PERMISSIONS[role][module]] >= RANK[need];

/** Maps a page path or API path to the module that protects it. */
export function moduleForPath(path: string): ModuleKey | null {
  const p = path.replace(/^\/api/, "");
  if (p.startsWith("/orders") || p.startsWith("/customers")) return "orders";
  if (p.startsWith("/warehouse") || p.startsWith("/print")) return "warehouse";
  if (p.startsWith("/fleet")) return "fleet";
  if (p.startsWith("/dispatch") || p.startsWith("/routing") || p.startsWith("/trips")) return "dispatch";
  if (p.startsWith("/driver")) return "driverApp";
  if (p.startsWith("/dashboard") || p.startsWith("/reports")) return "reports";
  if (p.startsWith("/admin")) return "admin";
  return null;
}
