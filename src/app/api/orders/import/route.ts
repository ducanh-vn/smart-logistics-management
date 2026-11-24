import { NextResponse } from "next/server";
import { requireAccess } from "@/services/auth/guard";
import { importOrders } from "@/services/orders/importExcel";

export async function POST(req: Request) {
  const g = await requireAccess("orders", "FULL");
  if (g.error) return g.error;
  const file = (await req.formData()).get("file");
  if (!(file instanceof File)) return NextResponse.json({ message: "Chưa chọn file" }, { status: 400 });
  if (file.size > 5_000_000) return NextResponse.json({ message: "File quá lớn (tối đa 5 MB)" }, { status: 413 });
  if (!file.name.toLowerCase().endsWith(".xlsx")) return NextResponse.json({ message: "Chỉ hỗ trợ file .xlsx" }, { status: 400 });
  try {
    return NextResponse.json(await importOrders(await file.arrayBuffer(), g.user));
  } catch {
    return NextResponse.json({ message: "Không đọc được file Excel" }, { status: 400 });
  }
}
