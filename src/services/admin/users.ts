import "server-only";
import bcrypt from "bcryptjs";
import { db } from "@/services/db";
import { writeAudit } from "@/services/audit";
import { PASSWORD_RULE } from "@/services/auth/login";
import type { CommandResult } from "@/services/orders/commands";
import { ROLES } from "@/constants/roles";
import { USERNAME_REGEX } from "@/constants/admin";
import type { NewUserInput, UserPatch, UserRow } from "@/types/admin";
import type { Role, SessionUser } from "@/types/auth";

export async function listUsers(): Promise<UserRow[]> {
  const users = await db.user.findMany({ orderBy: [{ role: "asc" }, { username: "asc" }] });
  const now = Date.now();
  return users.map((u) => ({
    id: u.id, username: u.username, fullName: u.fullName, role: u.role as Role, active: u.active,
    locked: !!u.lockedUntil && u.lockedUntil.getTime() > now, mustChangePassword: u.mustChangePassword, createdAt: u.createdAt.toISOString(),
  }));
}

/** FR32 / TC12 – new account must change the temporary password at first login (TC11). */
export async function createUser(input: NewUserInput, admin: SessionUser): Promise<CommandResult<{ id: number }>> {
  const username = input.username?.trim().toLowerCase();
  if (!USERNAME_REGEX.test(username ?? "")) return { ok: false, status: 400, message: "Tên đăng nhập 3–30 ký tự: chữ thường, số, dấu chấm hoặc gạch dưới" };
  if (!input.fullName?.trim()) return { ok: false, status: 400, message: "Nhập họ tên" };
  if (!ROLES.includes(input.role)) return { ok: false, status: 400, message: "Vai trò không hợp lệ" };
  if (!PASSWORD_RULE.test(input.password ?? "")) return { ok: false, status: 400, message: "Mật khẩu tạm tối thiểu 8 ký tự, gồm cả chữ và số" };
  if (await db.user.findUnique({ where: { username } })) return { ok: false, status: 409, message: `Tên đăng nhập ${username} đã tồn tại` };
  const u = await db.user.create({
    data: { username, fullName: input.fullName.trim(), role: input.role, passwordHash: await bcrypt.hash(input.password, 10), mustChangePassword: true },
  });
  await writeAudit({ userId: admin.id, action: "CREATE", entity: "User", entityId: username, newValue: { role: input.role } });
  return { ok: true, data: { id: u.id } };
}

/** Change role, lock/unlock, reset password. An admin cannot lock or demote themselves. */
export async function updateUser(id: number, patch: UserPatch, admin: SessionUser): Promise<CommandResult<{ id: number }>> {
  const u = await db.user.findUnique({ where: { id } });
  if (!u) return { ok: false, status: 404, message: "Không tìm thấy người dùng" };
  if (id === admin.id && (patch.active === false || (patch.role && patch.role !== "ADMIN"))) return { ok: false, status: 400, message: "Không thể tự khóa hoặc đổi vai trò của chính mình" };
  if (patch.role && !ROLES.includes(patch.role)) return { ok: false, status: 400, message: "Vai trò không hợp lệ" };
  if (patch.resetPassword !== undefined && !PASSWORD_RULE.test(patch.resetPassword)) return { ok: false, status: 400, message: "Mật khẩu tạm tối thiểu 8 ký tự, gồm cả chữ và số" };
  const data = {
    ...(patch.role ? { role: patch.role } : {}),
    ...(patch.active !== undefined ? { active: patch.active } : {}),
    ...(patch.unlock ? { lockedUntil: null, failedLogins: 0 } : {}),
    ...(patch.resetPassword ? { passwordHash: await bcrypt.hash(patch.resetPassword, 10), mustChangePassword: true } : {}),
  };
  await db.user.update({ where: { id }, data });
  await writeAudit({
    userId: admin.id, action: "UPDATE", entity: "User", entityId: u.username,
    oldValue: { role: u.role, active: u.active }, newValue: { ...patch, resetPassword: patch.resetPassword ? "***" : undefined },
  });
  return { ok: true, data: { id } };
}
