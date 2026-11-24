import { NextResponse } from "next/server";
import { requireAccess } from "@/services/auth/guard";
import { getDocument } from "@/services/warehouse/queries";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await requireAccess("warehouse");
  if (g.error) return g.error;
  const doc = await getDocument(Number((await params).id));
  return doc ? NextResponse.json(doc) : NextResponse.json({ message: "Không tìm thấy phiếu" }, { status: 404 });
}
