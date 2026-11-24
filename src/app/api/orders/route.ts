import { NextResponse } from "next/server";
import { requireAccess } from "@/services/auth/guard";
import { listOrders } from "@/services/orders/queries";
import { createOrder } from "@/services/orders/commands";
import type { OrderStatus } from "@/types/order";

export async function GET(req: Request) {
  const g = await requireAccess("orders");
  if (g.error) return g.error;
  const p = new URL(req.url).searchParams;
  const data = await listOrders({
    q: p.get("q") ?? undefined,
    status: (p.get("status") ?? "") as OrderStatus | "",
    warehouseId: Number(p.get("warehouseId")) || undefined,
    today: p.get("today") === "1",
    page: Number(p.get("page")) || 1,
    size: Number(p.get("size")) || 20,
  });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const g = await requireAccess("orders", "FULL");
  if (g.error) return g.error;
  const res = await createOrder(await req.json(), g.user);
  return res.ok ? NextResponse.json(res.data, { status: 201 }) : NextResponse.json(res, { status: res.status });
}
