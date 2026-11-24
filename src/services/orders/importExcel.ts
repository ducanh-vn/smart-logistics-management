import "server-only";
import ExcelJS from "exceljs";
import { db } from "@/services/db";
import { createOrder } from "./commands";
import { isEmptyRow, toImportRow } from "@/lib/importRows";
import { IMPORT_COLUMNS } from "@/constants/importTemplate";
import type { SessionUser } from "@/types/auth";

export interface ImportReport {
  created: string[];
  errors: { row: number; messages: string[] }[];
}

/** UC04 – import orders from Excel; invalid rows are reported and skipped (TC14, TC15). */
export async function importOrders(buffer: ArrayBuffer, user: SessionUser): Promise<ImportReport> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  const ws = wb.worksheets[0];
  if (!ws) return { created: [], errors: [{ row: 0, messages: ["File không có trang tính"] }] };
  const header = (ws.getRow(1).values as unknown[]).slice(1).map((v) => String(v ?? "").trim());
  if (header[0] !== IMPORT_COLUMNS[0].header) return { created: [], errors: [{ row: 1, messages: ["Sai định dạng file: hãy dùng file mẫu"] }] };

  const customers = new Map((await db.customer.findMany({ select: { id: true, code: true } })).map((c) => [c.code, c.id]));
  const report: ImportReport = { created: [], errors: [] };
  for (let r = 2; r <= ws.rowCount; r++) {
    const row = toImportRow((ws.getRow(r).values as unknown[]).slice(1));
    if (isEmptyRow(row)) continue;
    const customerId = customers.get(row.customerCode);
    if (!customerId) {
      report.errors.push({ row: r, messages: [`Mã khách hàng “${row.customerCode}” không tồn tại`] });
      continue;
    }
    const res = await createOrder(
      { customerId, warehouseId: 0, receiverName: row.receiverName, receiverPhone: row.receiverPhone, address: row.address,
        district: row.district, weightKg: Number(row.weightKg.replace(",", ".")), volumeM3: 0, expectedDate: "", items: [] },
      user,
    );
    if (res.ok) report.created.push(res.data.code);
    else report.errors.push({ row: r, messages: res.errors?.map((e) => `${e.field}: ${e.message}`) ?? [res.message] });
  }
  return report;
}

/** Builds the import template workbook. */
export async function buildTemplate(): Promise<ArrayBuffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Don hang");
  ws.columns = IMPORT_COLUMNS.map((c) => ({ header: c.header, key: c.key, width: c.width }));
  ws.addRow(Object.fromEntries(IMPORT_COLUMNS.map((c) => [c.key, c.example])));
  ws.getRow(1).font = { bold: true };
  ws.getColumn("receiverPhone").numFmt = "@";
  return (await wb.xlsx.writeBuffer()) as ArrayBuffer;
}
