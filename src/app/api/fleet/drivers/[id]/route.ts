import { NextResponse } from "next/server";
import { requireAccess } from "@/services/auth/guard";
import { updateDriver } from "@/services/fleet/drivers";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await requireAccess("fleet", "FULL");
  if (g.error) return g.error;
  const res = await updateDriver(Number((await params).id), await req.json(), g.user);
  return res.ok ? NextResponse.json(res.data) : NextResponse.json(res, { status: res.status });
}
