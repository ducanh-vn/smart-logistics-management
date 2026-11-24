import { NextResponse } from "next/server";
import { requireAccess } from "@/services/auth/guard";
import { listStock } from "@/services/warehouse/queries";

/** GET ?warehouseId=&q=&location=&low=1 */
export async function GET(req: Request) {
  const g = await requireAccess("warehouse");
  if (g.error) return g.error;
  const p = new URL(req.url).searchParams;
  const warehouseId = Number(p.get("warehouseId"));
  if (!warehouseId) return NextResponse.json({ message: "Thiếu kho" }, { status: 400 });
  return NextResponse.json(await listStock({ warehouseId, q: p.get("q") ?? undefined, location: p.get("location") ?? undefined, lowOnly: p.get("low") === "1" }));
}
