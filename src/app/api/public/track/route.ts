import { NextResponse } from "next/server";
import { trackOrder } from "@/services/delivery/tracking";

/** Public: GET ?code=DH...&phone=09... */
export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const code = p.get("code") ?? "";
  const phone = p.get("phone") ?? "";
  if (!code || !phone) return NextResponse.json({ message: "Nhập mã đơn và số điện thoại người nhận" }, { status: 400 });
  const res = await trackOrder(code, phone);
  return res ? NextResponse.json(res) : NextResponse.json({ message: "Không tìm thấy đơn hàng với mã và số điện thoại này" }, { status: 404 });
}
