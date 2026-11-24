import { NextResponse } from "next/server";
import { requireAccess } from "@/services/auth/guard";
import { getSettings, updateSettings } from "@/services/admin/config";

export async function GET() {
  const g = await requireAccess("admin");
  if (g.error) return g.error;
  return NextResponse.json(await getSettings());
}

export async function PUT(req: Request) {
  const g = await requireAccess("admin", "FULL");
  if (g.error) return g.error;
  const res = await updateSettings(await req.json(), g.user);
  return res.ok ? NextResponse.json(res.data) : NextResponse.json(res, { status: res.status });
}
