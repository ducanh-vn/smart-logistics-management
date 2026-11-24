export type Role = "ADMIN" | "MANAGER" | "DISPATCHER" | "STOREKEEPER" | "DRIVER";

/** Access level of a role on a module (see design doc, table 7.1). */
export type Access = "FULL" | "VIEW" | "LIMITED" | "NONE";

export type ModuleKey =
  | "orders"
  | "warehouse"
  | "fleet"
  | "dispatch"
  | "driverApp"
  | "reports"
  | "admin";

export interface SessionUser {
  id: number;
  username: string;
  fullName: string;
  role: Role;
  mustChangePassword: boolean;
}
