import { NextResponse } from "next/server";
import { requireAccess } from "@/services/auth/guard";
import { buildPlan } from "@/services/dispatch/plan";

/** POST { warehouseId, orderIds?, vehicleIds? } -> DispatchPlan (not saved). */
export async function POST(req: Request) {
  const g = await requireAccess("dispatch", "FULL");
  if (g.error) return g.error;
  const { warehouseId, orderIds, vehicleIds } = await req.json();
  const plan = await buildPlan(Number(warehouseId), orderIds, vehicleIds);
  if (!plan) return NextResponse.json({ message: "Không tìm thấy kho" }, { status: 404 });
  if (!plan.routes.length && !plan.unassigned.length) return NextResponse.json({ message: "Không có đơn chờ phân xe tại kho này" }, { status: 400 });
  return NextResponse.json(plan);
}
