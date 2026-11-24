import { NextResponse } from "next/server";
import { requireAccess } from "@/services/auth/guard";
import { listDriverTrips } from "@/services/delivery/driverTrips";

export async function GET() {
  const g = await requireAccess("driverApp");
  if (g.error) return g.error;
  return NextResponse.json(await listDriverTrips(g.user));
}
