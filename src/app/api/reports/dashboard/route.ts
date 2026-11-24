import { NextResponse } from "next/server";
import { requireAccess } from "@/services/auth/guard";
import { getDashboard } from "@/services/reports/dashboard";

export async function GET(req: Request) {
  const g = await requireAccess("reports");
  if (g.error) return g.error;
  const d = new URL(req.url).searchParams.get("date");
  const date = d ? new Date(`${d}T00:00:00`) : new Date();
  return NextResponse.json(await getDashboard(Number.isNaN(date.getTime()) ? new Date() : date));
}
