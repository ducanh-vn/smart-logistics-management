import { NextResponse } from "next/server";
import { requireAccess } from "@/services/auth/guard";
import { recordPosition } from "@/services/delivery/driverTrips";

/** FR23 – POST { lat, lng, speedKmh? } every <= 30 s while a trip is running. */
export async function POST(req: Request) {
  const g = await requireAccess("driverApp", "FULL");
  if (g.error) return g.error;
  const { lat, lng, speedKmh } = await req.json();
  const res = await recordPosition(g.user, Number(lat), Number(lng), Number(speedKmh) || 0);
  return res.ok ? NextResponse.json(res.data) : NextResponse.json(res, { status: res.status });
}
