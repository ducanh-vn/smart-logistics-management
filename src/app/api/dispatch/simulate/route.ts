import { NextResponse } from "next/server";
import { requireAccess } from "@/services/auth/guard";
import { simulateGpsTick } from "@/services/dispatch/simulate";
import { isDemoMode } from "@/lib/demo";

/** Demo GPS tick for running trips. */
export async function POST() {
  const g = await requireAccess("dispatch", "FULL");
  if (g.error) return g.error;
  if (!isDemoMode()) return NextResponse.json({ message: "Chỉ dùng trong chế độ chạy thử" }, { status: 403 });
  return NextResponse.json({ moved: await simulateGpsTick() });
}
