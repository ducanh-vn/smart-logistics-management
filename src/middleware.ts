import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/services/auth/session";
import { canAccess, moduleForPath } from "@/lib/permissions";
import { HOME_BY_ROLE } from "@/constants/roles";

const PUBLIC = ["/", "/login", "/tracking", "/api/auth/login", "/api/public"];

/** Protects every page and API: login required, role checked per module (NFR07). */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.some((p) => pathname === p || (p !== "/" && pathname.startsWith(p + "/")))) return NextResponse.next();

  const user = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  const isApi = pathname.startsWith("/api");
  if (!user) {
    if (isApi) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  const allowWhileMustChange = ["/change-password", "/api/auth/change-password", "/api/auth/logout"];
  if (user.mustChangePassword && !allowWhileMustChange.includes(pathname)) {
    return isApi
      ? NextResponse.json({ message: "Cần đổi mật khẩu trước khi sử dụng" }, { status: 403 })
      : NextResponse.redirect(new URL("/change-password", req.url));
  }
  const module = moduleForPath(pathname);
  if (module && !canAccess(user.role, module)) {
    if (isApi) return NextResponse.json({ message: "Không có quyền truy cập" }, { status: 403 });
    const url = new URL("/forbidden", req.url);
    url.searchParams.set("home", HOME_BY_ROLE[user.role]);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next|favicon.ico|.*\\.(?:png|jpg|svg|css|js)$).*)"] };
