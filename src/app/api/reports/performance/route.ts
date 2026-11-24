import { NextResponse } from "next/server";
import { requireAccess } from "@/services/auth/guard";
import { getPerformance, parseRange } from "@/services/reports/performance";

export async function GET(req: Request) {
  const g = await requireAccess("reports");
  if (g.error) return g.error;
  const p = new URL(req.url).searchParams;
  const { from, to } = parseRange(p.get("from"), p.get("to"));
  return NextResponse.json(await getPerformance(from, to));
}
