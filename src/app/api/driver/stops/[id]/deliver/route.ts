import { NextResponse } from "next/server";
import { requireAccess } from "@/services/auth/guard";
import { confirmDelivery } from "@/services/delivery/stopActions";

/** POST { otp, photo (data URL), lat?, lng? } */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await requireAccess("driverApp", "FULL");
  if (g.error) return g.error;
  const res = await confirmDelivery(Number((await params).id), await req.json(), g.user);
  return res.ok ? NextResponse.json(res.data) : NextResponse.json(res, { status: res.status });
}
