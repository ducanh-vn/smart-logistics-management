import { NextResponse } from "next/server";
import { requireAccess } from "@/services/auth/guard";
import { quoteFee } from "@/services/orders/commands";

export async function POST(req: Request) {
  const g = await requireAccess("orders");
  if (g.error) return g.error;
  const { district = "", weightKg = 0 } = await req.json();
  const q = await quoteFee(String(district), Number(weightKg));
  return q ? NextResponse.json(q) : NextResponse.json({ message: "Chưa đủ thông tin tính cước" }, { status: 400 });
}
