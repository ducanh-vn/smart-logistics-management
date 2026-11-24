import { NextResponse } from "next/server";
import { requireAccess } from "@/services/auth/guard";
import { startDriverTrip } from "@/services/delivery/driverTrips";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await requireAccess("driverApp", "FULL");
  if (g.error) return g.error;
  const res = await startDriverTrip(Number((await params).id), g.user);
  return res.ok ? NextResponse.json(res.data) : NextResponse.json(res, { status: res.status });
}
