import { SignJWT, jwtVerify } from "jose";
import type { SessionUser } from "@/types/auth";
import { SESSION_HOURS } from "@/constants/business";

export const SESSION_COOKIE = "slms_session";

/** In production a missing or short AUTH_SECRET would let anyone forge a session, so refuse to run. */
export function authSecret(): string {
  const s = process.env.AUTH_SECRET ?? "";
  if (process.env.NODE_ENV === "production" && (s.length < 32 || s.startsWith("change-me"))) {
    throw new Error("AUTH_SECRET must be set to a random string of at least 32 characters");
  }
  return s || "dev-only-secret-change-me";
}

const secret = () => new TextEncoder().encode(authSecret());

/** Signs the session as a JWT (design doc 7.1). Works in Node and Edge runtimes. */
export async function signSession(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(secret());
}

export async function verifySession(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_HOURS * 3600,
};
