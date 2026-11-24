import { NextResponse } from "next/server";
import { requireAccess } from "@/services/auth/guard";
import { listVehicles, saveVehicle } from "@/services/fleet/vehicles";

export async function GET() {
  const g = await requireAccess("fleet");
  if (g.error) return g.error;
  return NextResponse.json(await listVehicles());
}

export async function POST(req: Request) {
  const g = await requireAccess("fleet", "FULL");
  if (g.error) return g.error;
  const res = await saveVehicle(await req.json(), g.user);
  return res.ok ? NextResponse.json(res.data, { status: 201 }) : NextResponse.json(res, { status: res.status });
}
