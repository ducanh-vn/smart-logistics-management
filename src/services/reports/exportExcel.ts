import "server-only";
import ExcelJS from "exceljs";
import type { PerformanceReport } from "@/types/report";
import { formatDate } from "@/lib/format";

/** FR30 – performance report as .xlsx (Vietnamese headers, number formats). */
export async function performanceWorkbook(r: PerformanceReport): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Hiệu suất theo xe");
  ws.addRow([`BÁO CÁO HIỆU SUẤT PHƯƠNG TIỆN từ ${formatDate(r.from)} đến ${formatDate(r.to)}`]).font = { bold: true, size: 13 };
  ws.addRow([]);
  const header = ws.addRow(["STT", "Biển số", "Loại xe", "Số chuyến", "Số điểm giao", "Quãng đường (km)", "Khối lượng (kg)", "Tải trọng sử dụng", "Chi phí (đ)", "Chi phí/điểm (đ)"]);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.eachCell((c) => { c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F3864" } }; });
  r.rows.forEach((v, i) => ws.addRow([i + 1, v.plate, v.type, v.trips, v.stops, v.totalKm, v.totalKg, v.loadFactor, v.cost, v.costPerStop]));
  const total = ws.addRow(["", "Tổng cộng", "", r.totals.trips, r.totals.stops, r.totals.totalKm, r.totals.totalKg, r.totals.loadFactor, r.totals.cost, ""]);
  total.font = { bold: true };
  ws.columns.forEach((col, i) => { col.width = [6, 14, 14, 10, 13, 17, 16, 18, 16, 16][i]; });
  ws.getColumn(8).numFmt = "0.0%";
  [6, 7, 9, 10].forEach((c) => { ws.getColumn(c).numFmt = "#,##0"; });
  return Buffer.from(await wb.xlsx.writeBuffer());
}
