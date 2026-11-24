import { NextResponse } from "next/server";
import { requireAccess } from "@/services/auth/guard";
import { listDrivers } from "@/services/fleet/drivers";

export async function GET() {
  const g = await requireAccess("fleet");
  if (g.error) return g.error;
  return NextResponse.json(await listDrivers());
}
