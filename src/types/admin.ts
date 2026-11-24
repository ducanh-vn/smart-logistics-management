import type { Role } from "./auth";

export interface UserRow {
  id: number;
  username: string;
  fullName: string;
  role: Role;
  active: boolean;
  locked: boolean;
  mustChangePassword: boolean;
  createdAt: string;
}

export interface NewUserInput {
  username: string;
  fullName: string;
  role: Role;
  password: string;
}

export interface AuditRow {
  id: number;
  at: string;
  username: string | null;
  action: string;
  entity: string;
  entityId: string;
  oldValue: string | null;
  newValue: string | null;
}

export interface SettingDef {
  key: string;
  label: string;
  type: "text" | "number";
  defaultValue: string;
  hint?: string;
}

export type UserPatch = { role?: Role; active?: boolean; unlock?: boolean; resetPassword?: string };
