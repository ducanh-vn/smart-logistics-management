import { buildTemplate } from "@/services/orders/importExcel";

export async function GET() {
  return new Response(await buildTemplate(), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="mau_nhap_don_hang.xlsx"',
    },
  });
}
