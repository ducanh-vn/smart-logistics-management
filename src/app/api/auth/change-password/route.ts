import { NextResponse } from "next/server";
import { getCurrentUser } from "@/services/auth/currentUser";
import { changePassword } from "@/services/auth/login";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/services/auth/session";
import { HOME_BY_ROLE } from "@/constants/roles";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
  const { current = "", next = "" } = await req.json().catch(() => ({}));
  const error = await changePassword(user.id, String(current), String(next));
  if (error) return NextResponse.json({ message: error }, { status: 400 });
  const updated = { ...user, mustChangePassword: false };
  const res = NextResponse.json({ redirect: HOME_BY_ROLE[user.role] });
  res.cookies.set(SESSION_COOKIE, await signSession(updated), sessionCookieOptions);
  return res;
}
