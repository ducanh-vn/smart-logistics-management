import bcrypt from "bcryptjs";
import { db } from "@/services/db";
import { writeAudit } from "@/services/audit";
import { LOGIN_LOCK_MINUTES, LOGIN_MAX_FAILS } from "@/constants/business";
import type { Role, SessionUser } from "@/types/auth";

export type LoginResult =
  | { ok: true; user: SessionUser }
  | { ok: false; reason: "INVALID" | "LOCKED" | "INACTIVE"; lockedUntil?: Date };

/** UC01 – login with lockout after 5 consecutive failures for 15 minutes (NFR06, TC09, TC10). */
export async function login(username: string, password: string): Promise<LoginResult> {
  const user = await db.user.findUnique({ where: { username: username.trim() } });
  if (!user) return { ok: false, reason: "INVALID" };
  if (!user.active) return { ok: false, reason: "INACTIVE" };
  if (user.lockedUntil && user.lockedUntil > new Date()) return { ok: false, reason: "LOCKED", lockedUntil: user.lockedUntil };

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const fails = user.failedLogins + 1;
    const lock = fails >= LOGIN_MAX_FAILS ? new Date(Date.now() + LOGIN_LOCK_MINUTES * 60_000) : null;
    await db.user.update({ where: { id: user.id }, data: { failedLogins: lock ? 0 : fails, lockedUntil: lock } });
    return lock ? { ok: false, reason: "LOCKED", lockedUntil: lock } : { ok: false, reason: "INVALID" };
  }

  await db.user.update({ where: { id: user.id }, data: { failedLogins: 0, lockedUntil: null } });
  await writeAudit({ userId: user.id, action: "LOGIN", entity: "User", entityId: user.id });
  return {
    ok: true,
    user: { id: user.id, username: user.username, fullName: user.fullName, role: user.role as Role, mustChangePassword: user.mustChangePassword },
  };
}

export const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

/** FR31 – change password (mandatory on first login). */
export async function changePassword(userId: number, current: string, next: string): Promise<string | null> {
  if (!PASSWORD_RULE.test(next)) return "Mật khẩu tối thiểu 8 ký tự, gồm cả chữ và số";
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || !(await bcrypt.compare(current, user.passwordHash))) return "Mật khẩu hiện tại không đúng";
  if (current === next) return "Mật khẩu mới phải khác mật khẩu hiện tại";
  await db.user.update({ where: { id: userId }, data: { passwordHash: await bcrypt.hash(next, 12), mustChangePassword: false } });
  return null;
}
