import { NextResponse } from "next/server";
import { requireAccess } from "@/services/auth/guard";
import { setMaintenance } from "@/services/fleet/vehicles";

/** POST { action: "START" | "FINISH" } */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await requireAccess("fleet", "FULL");
  if (g.error) return g.error;
  const { action } = await req.json();
  if (!["START", "FINISH"].includes(action)) return NextResponse.json({ message: "Thao tác không hợp lệ" }, { status: 400 });
  const res = await setMaintenance(Number((await params).id), action, g.user);
  return res.ok ? NextResponse.json(res.data) : NextResponse.json(res, { status: res.status });
}
