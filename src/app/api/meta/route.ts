import { NextResponse } from "next/server";
import { db } from "@/services/db";
import { getCurrentUser } from "@/services/auth/currentUser";

/** Reference data shared by many screens (warehouses). */
export async function GET() {
  if (!(await getCurrentUser())) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
  const warehouses = await db.warehouse.findMany({ select: { id: true, code: true, name: true, lat: true, lng: true }, orderBy: { id: "asc" } });
  return NextResponse.json({ warehouses });
}
