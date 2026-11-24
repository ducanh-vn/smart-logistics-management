import { NextResponse } from "next/server";
import { requireAccess } from "@/services/auth/guard";
import { listLocations } from "@/services/warehouse/queries";

export async function GET(req: Request) {
  const g = await requireAccess("warehouse");
  if (g.error) return g.error;
  return NextResponse.json(await listLocations(Number(new URL(req.url).searchParams.get("warehouseId"))));
}
