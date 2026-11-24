import "server-only";
import { db } from "@/services/db";
import { writeAudit } from "@/services/audit";
import type { CommandResult } from "@/services/orders/commands";
import { docCode, isValidQty, stocktakeDiff } from "@/lib/stock";
import type { StocktakeLineInput } from "@/types/warehouse";
import type { SessionUser } from "@/types/auth";

/** UC08 / FR09 – records counted quantities as signed differences; stock is NOT changed until approval (TC22). */
export async function createStocktake(warehouseId: number, lines: StocktakeLineInput[], user: SessionUser): Promise<CommandResult<{ id: number; code: string; diffs: number }>> {
  if (!lines.length) return { ok: false, status: 400, message: "Phiếu kiểm kê chưa có dòng hàng" };
  if (lines.some((l) => !isValidQty(l.counted, true))) return { ok: false, status: 400, message: "Số đếm thực tế phải là số nguyên không âm" };

  const items = await db.stockItem.findMany({ where: { location: { warehouseId }, barcode: { in: lines.map((l) => l.barcode) } }, include: { location: true } });
  const rows: { barcode: string; name: string; quantity: number; locationId: number }[] = [];
  for (const l of lines) {
    const it = items.find((i) => i.barcode === l.barcode && i.location.code === l.locationCode);
    if (!it) return { ok: false, status: 400, message: `Không có mã ${l.barcode} tại vị trí ${l.locationCode}` };
    rows.push({ barcode: it.barcode, name: it.name, quantity: stocktakeDiff(it.quantity, l.counted), locationId: it.locationId });
  }

  const doc = await db.$transaction(async (tx) => {
    const d = await tx.stockDocument.create({ data: { code: `TMP${Date.now()}`, type: "STOCKTAKE", status: "PENDING", warehouseId, createdBy: user.username, lines: { create: rows } } });
    return tx.stockDocument.update({ where: { id: d.id }, data: { code: docCode("STOCKTAKE", d.id) } });
  });
  await writeAudit({ userId: user.id, action: "CREATE", entity: "StockDocument", entityId: doc.code, newValue: rows });
  return { ok: true, data: { id: doc.id, code: doc.code, diffs: rows.filter((r) => r.quantity !== 0).length } };
}

/** Approves a pending stocktake: applies each difference to the stock item (never below zero). */
export async function approveStocktake(id: number, user: SessionUser): Promise<CommandResult<{ code: string }>> {
  const doc = await db.stockDocument.findUnique({ where: { id }, include: { lines: true } });
  if (!doc || doc.type !== "STOCKTAKE") return { ok: false, status: 404, message: "Không tìm thấy phiếu kiểm kê" };
  if (doc.status !== "PENDING") return { ok: false, status: 409, message: "Phiếu đã được xử lý" };
  if (doc.createdBy === user.username && user.role !== "ADMIN")
    return { ok: false, status: 403, message: "Người lập phiếu không được tự duyệt, cần thủ kho khác hoặc quản trị duyệt" };

  await db.$transaction(async (tx) => {
    for (const l of doc.lines) {
      if (!l.locationId || l.quantity === 0) continue;
      const it = await tx.stockItem.findUnique({ where: { locationId_barcode: { locationId: l.locationId, barcode: l.barcode } } });
      if (it) await tx.stockItem.update({ where: { id: it.id }, data: { quantity: Math.max(0, it.quantity + l.quantity) } });
    }
    await tx.stockDocument.update({ where: { id }, data: { status: "DONE" } });
  });
  await writeAudit({ userId: user.id, action: "UPDATE", entity: "StockDocument", entityId: doc.code, oldValue: { status: "PENDING" }, newValue: { status: "DONE" } });
  return { ok: true, data: { code: doc.code } };
}
