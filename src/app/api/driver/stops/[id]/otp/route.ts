import { NextResponse } from "next/server";
import { requireAccess } from "@/services/auth/guard";
import { sendOtp } from "@/services/delivery/stopActions";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await requireAccess("driverApp", "FULL");
  if (g.error) return g.error;
  const res = await sendOtp(Number((await params).id), g.user);
  return res.ok ? NextResponse.json(res.data) : NextResponse.json(res, { status: res.status });
}
