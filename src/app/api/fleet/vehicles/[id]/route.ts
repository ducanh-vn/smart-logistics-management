import { NextResponse } from "next/server";
import { requireAccess } from "@/services/auth/guard";
import { saveVehicle } from "@/services/fleet/vehicles";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await requireAccess("fleet", "FULL");
  if (g.error) return g.error;
  const res = await saveVehicle(await req.json(), g.user, Number((await params).id));
  return res.ok ? NextResponse.json(res.data) : NextResponse.json(res, { status: res.status });
}
