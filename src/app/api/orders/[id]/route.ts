import { NextResponse } from "next/server";
import { requireAccess } from "@/services/auth/guard";
import { getOrder } from "@/services/orders/queries";
import { updateOrder } from "@/services/orders/commands";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Ctx) {
  const g = await requireAccess("orders");
  if (g.error) return g.error;
  const order = await getOrder(Number((await params).id));
  return order ? NextResponse.json(order) : NextResponse.json({ message: "Không tìm thấy đơn hàng" }, { status: 404 });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const g = await requireAccess("orders", "FULL");
  if (g.error) return g.error;
  const res = await updateOrder(Number((await params).id), await req.json(), g.user);
  return res.ok ? NextResponse.json(res.data) : NextResponse.json(res, { status: res.status });
}
