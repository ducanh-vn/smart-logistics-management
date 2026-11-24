import "server-only";
import { NextResponse } from "next/server";
import type { ModuleKey, SessionUser } from "@/types/auth";
import { canAccess } from "@/lib/permissions";
import { vi } from "@/constants/i18n/vi";
import { getCurrentUser } from "./currentUser";

type GuardResult = { user: SessionUser; error?: undefined } | { user?: undefined; error: NextResponse };

/** API guard: 401 when not logged in, 403 when the role lacks access (TC07). */
export async function requireAccess(module: ModuleKey, need: "VIEW" | "FULL" = "VIEW"): Promise<GuardResult> {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 }) };
  if (!canAccess(user.role, module, need)) return { error: NextResponse.json({ message: vi.errors.forbidden }, { status: 403 }) };
  return { user };
}
