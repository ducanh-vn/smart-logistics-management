import { NextResponse } from "next/server";
import { requireAccess } from "@/services/auth/guard";
import { dispatchResources } from "@/services/dispatch/plan";

export async function GET(req: Request) {
  const g = await requireAccess("dispatch");
  if (g.error) return g.error;
  return NextResponse.json(await dispatchResources(Number(new URL(req.url).searchParams.get("warehouseId"))));
}
