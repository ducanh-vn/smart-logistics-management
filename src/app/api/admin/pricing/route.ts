import { NextResponse } from "next/server";
import { requireAccess } from "@/services/auth/guard";
import { getPriceRules } from "@/services/orders/commands";
import { updatePriceRule } from "@/services/admin/config";

export async function GET() {
  const g = await requireAccess("admin");
  if (g.error) return g.error;
  return NextResponse.json(await getPriceRules());
}

/** PATCH { zone, baseFee, includedKg, perKgFee } */
export async function PATCH(req: Request) {
  const g = await requireAccess("admin", "FULL");
  if (g.error) return g.error;
  const { zone, ...rest } = await req.json();
  const res = await updatePriceRule(zone, rest, g.user);
  return res.ok ? NextResponse.json(res.data) : NextResponse.json(res, { status: res.status });
}
