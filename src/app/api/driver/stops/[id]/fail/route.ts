import { NextResponse } from "next/server";
import { requireAccess } from "@/services/auth/guard";
import { reportFailure } from "@/services/delivery/stopActions";

/** POST { reason, photo (data URL) } */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await requireAccess("driverApp", "FULL");
  if (g.error) return g.error;
  const { reason, photo } = await req.json();
  const res = await reportFailure(Number((await params).id), reason, photo, g.user);
  return res.ok ? NextResponse.json(res.data) : NextResponse.json(res, { status: res.status });
}
