import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { db } from "@/services/db";
import { SESSION_COOKIE, verifySession } from "./session";
import type { Role, SessionUser } from "@/types/auth";

/**
 * Reads the logged-in user in server components and route handlers.
 * The signed cookie only proves who the user is; role, lock and password state are re-read
 * from the database so that an admin locking or changing a user takes effect immediately.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies();
  const session = await verifySession(store.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const u = await db.user.findUnique({
    where: { id: session.id },
    select: { id: true, username: true, fullName: true, role: true, active: true, mustChangePassword: true, lockedUntil: true },
  });
  if (!u || !u.active || (u.lockedUntil && u.lockedUntil > new Date())) return null;
  return { id: u.id, username: u.username, fullName: u.fullName, role: u.role as Role, mustChangePassword: u.mustChangePassword };
});
