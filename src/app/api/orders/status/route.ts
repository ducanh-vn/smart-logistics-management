import { NextResponse } from "next/server";
import { requireAccess } from "@/services/auth/guard";
import { changeStatus } from "@/services/orders/commands";

/** Bulk approve / cancel: { ids: number[], to: "APPROVED" | "CANCELLED" } */
export async function POST(req: Request) {
  const g = await requireAccess("orders", "FULL");
  if (g.error) return g.error;
  const { ids = [], to, note } = await req.json();
  if (!["APPROVED", "CANCELLED"].includes(to)) return NextResponse.json({ message: "Thao tác không hợp lệ" }, { status: 400 });
  return NextResponse.json(await changeStatus(ids.map(Number), to, g.user, note));
}
