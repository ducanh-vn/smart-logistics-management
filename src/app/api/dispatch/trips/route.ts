import { NextResponse } from "next/server";
import { requireAccess } from "@/services/auth/guard";
import { confirmTrips, listTodayTrips } from "@/services/dispatch/trips";

export async function GET(req: Request) {
  const g = await requireAccess("dispatch");
  if (g.error) return g.error;
  return NextResponse.json(await listTodayTrips(Number(new URL(req.url).searchParams.get("warehouseId")) || undefined));
}

/** POST { warehouseId, trips: [{ vehicleId, driverId, orderIds }] } */
export async function POST(req: Request) {
  const g = await requireAccess("dispatch", "FULL");
  if (g.error) return g.error;
  const { warehouseId, trips = [] } = await req.json();
  const res = await confirmTrips(Number(warehouseId), trips, g.user);
  return res.ok ? NextResponse.json(res.data, { status: 201 }) : NextResponse.json(res, { status: res.status });
}
