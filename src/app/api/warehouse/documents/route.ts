import { NextResponse } from "next/server";
import { requireAccess } from "@/services/auth/guard";
import { listDocuments } from "@/services/warehouse/queries";
import { createIssue, createReceipt } from "@/services/warehouse/commands";
import { createStocktake } from "@/services/warehouse/stocktake";
import type { StockDocType } from "@/types/warehouse";

export async function GET(req: Request) {
  const g = await requireAccess("warehouse");
  if (g.error) return g.error;
  const p = new URL(req.url).searchParams;
  return NextResponse.json(await listDocuments(Number(p.get("warehouseId")), (p.get("type") || undefined) as StockDocType | undefined));
}

/** POST { type, warehouseId, lines, tripId? } – dispatches to the right command. */
export async function POST(req: Request) {
  const g = await requireAccess("warehouse", "FULL");
  if (g.error) return g.error;
  const { type, warehouseId, lines = [], tripId } = await req.json();
  const wid = Number(warehouseId);
  const res =
    type === "RECEIPT" ? await createReceipt(wid, lines, g.user)
    : type === "ISSUE" ? await createIssue(wid, lines, g.user, tripId ? Number(tripId) : undefined)
    : type === "STOCKTAKE" ? await createStocktake(wid, lines, g.user)
    : null;
  if (!res) return NextResponse.json({ message: "Loại phiếu không hợp lệ" }, { status: 400 });
  return res.ok ? NextResponse.json(res.data, { status: 201 }) : NextResponse.json(res, { status: res.status });
}
