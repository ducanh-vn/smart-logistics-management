import { NextResponse } from "next/server";
import { login } from "@/services/auth/login";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/services/auth/session";
import { HOME_BY_ROLE } from "@/constants/roles";
import { formatDateTime } from "@/lib/format";

const MESSAGES = {
  INVALID: "Tên đăng nhập hoặc mật khẩu không đúng",
  INACTIVE: "Tài khoản đã bị khóa bởi quản trị viên",
  LOCKED: "Tài khoản tạm khóa do nhập sai nhiều lần",
};

export async function POST(req: Request) {
  const { username = "", password = "" } = await req.json().catch(() => ({}));
  const result = await login(String(username), String(password));
  if (!result.ok) {
    const until = result.lockedUntil ? ` đến ${formatDateTime(result.lockedUntil)}` : "";
    return NextResponse.json({ message: MESSAGES[result.reason] + until }, { status: 401 });
  }
  const redirect = result.user.mustChangePassword ? "/change-password" : HOME_BY_ROLE[result.user.role];
  const res = NextResponse.json({ user: result.user, redirect });
  res.cookies.set(SESSION_COOKIE, await signSession(result.user), sessionCookieOptions);
  return res;
}
