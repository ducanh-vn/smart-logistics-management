/** Demo mode shows test accounts, on-screen OTP and the GPS simulator. On by default in development; set NEXT_PUBLIC_DEMO_MODE="0" on a public deployment. */
export const isDemoMode = (): boolean => {
  const flag = process.env.NEXT_PUBLIC_DEMO_MODE;
  return flag === "1" || (flag === undefined && process.env.NODE_ENV !== "production");
};

/** Only same-site relative paths are allowed as a post-login redirect (blocks open redirects). */
export const safeNextPath = (next: string | null | undefined): string | null =>
  next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : null;

/** Rough decoded size of a data: URL in bytes. */
export const dataUrlBytes = (dataUrl: string): number => Math.floor(((dataUrl.length - dataUrl.indexOf(",") - 1) * 3) / 4);
