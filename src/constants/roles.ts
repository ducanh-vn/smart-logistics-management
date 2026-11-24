import type { Access, ModuleKey, Role } from "@/types/auth";

export const ROLES: Role[] = ["ADMIN", "MANAGER", "DISPATCHER", "STOREKEEPER", "DRIVER"];

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Quản trị viên",
  MANAGER: "Nhà quản lý",
  DISPATCHER: "Điều phối viên",
  STOREKEEPER: "Thủ kho",
  DRIVER: "Tài xế",
};

/** Permission matrix – design doc SLMS-TK-01, table 7.1. */
export const PERMISSIONS: Record<Role, Record<ModuleKey, Access>> = {
  ADMIN: { orders: "VIEW", warehouse: "VIEW", fleet: "VIEW", dispatch: "VIEW", driverApp: "NONE", reports: "VIEW", admin: "FULL" },
  MANAGER: { orders: "VIEW", warehouse: "VIEW", fleet: "VIEW", dispatch: "VIEW", driverApp: "NONE", reports: "FULL", admin: "VIEW" },
  DISPATCHER: { orders: "FULL", warehouse: "VIEW", fleet: "FULL", dispatch: "FULL", driverApp: "NONE", reports: "VIEW", admin: "NONE" },
  STOREKEEPER: { orders: "VIEW", warehouse: "FULL", fleet: "NONE", dispatch: "NONE", driverApp: "NONE", reports: "VIEW", admin: "NONE" },
  DRIVER: { orders: "VIEW", warehouse: "NONE", fleet: "LIMITED", dispatch: "NONE", driverApp: "FULL", reports: "NONE", admin: "NONE" },
};

/** Landing page after login, per role. */
export const HOME_BY_ROLE: Record<Role, string> = {
  ADMIN: "/admin",
  MANAGER: "/dashboard",
  DISPATCHER: "/orders",
  STOREKEEPER: "/warehouse",
  DRIVER: "/driver",
};
