import { NextResponse } from "next/server";
import { requireAccess } from "@/services/auth/guard";
import { db } from "@/services/db";

export async function GET() {
  const g = await requireAccess("orders");
  if (g.error) return g.error;
  return NextResponse.json(await db.customer.findMany({ select: { id: true, code: true, name: true }, orderBy: { code: "asc" } }));
}
