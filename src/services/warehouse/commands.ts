import "server-only";
import { db } from "@/services/db";
import { writeAudit } from "@/services/audit";
import { startTrip } from "@/services/delivery/lifecycle";
import { getNumberSetting } from "@/services/admin/config";
import type { CommandResult } from "@/services/orders/commands";
import { allocate, docCode, findShortages, isLowStock, isValidQty } from "@/lib/stock";
import type { IssueLineInput, ShortageError, StockDocType, StockLineInput } from "@/types/warehouse";
import type { SessionUser } from "@/types/auth";

type Tx = Parameters<Parameters<typeof db.$transaction>[0]>[0];

/** Creates the document shell and gives it a sequential code (PN/PX/PK + 6 digits). */
async function createDoc(tx: Tx, type: StockDocType, warehouseId: number, user: SessionUser, extra: { status?: string; tripId?: number } = {}) {
  const doc = await tx.stockDocument.create({ data: { code: `TMP${Date.now()}`, type, warehouseId, createdBy: user.username, ...extra } });
  return tx.stockDocument.update({ where: { id: doc.id }, data: { code: docCode(type, doc.id) } });
}

/** UC06 / FR07 / FR10 – receipt: each line goes to a location; stock increases immediately (TC19, TC23). */
export async function createReceipt(warehouseId: number, lines: StockLineInput[], user: SessionUser): Promise<CommandResult<{ id: number; code: string }>> {
  if (!lines.length) return { ok: false, status: 400, message: "Phiếu nhập chưa có dòng hàng" };
  if (lines.some((l) => !l.barcode || !l.name || !isValidQty(l.quantity)))
    return { ok: false, status: 400, message: "Mỗi dòng cần mã vạch, tên hàng và số lượng nguyên dương" };

  const locations = await db.location.findMany({ where: { warehouseId } });
  const byCode = new Map(locations.map((l) => [l.code, l.id]));
  const existing = await db.stockItem.findMany({ where: { location: { warehouseId }, barcode: { in: lines.map((l) => l.barcode) } } });
  const resolved: { line: StockLineInput; locationId: number }[] = [];
  for (const line of lines) {
    const locationId = line.locationCode ? byCode.get(line.locationCode) : existing.find((e) => e.barcode === line.barcode)?.locationId;
    if (!locationId) return { ok: false, status: 400, message: `Chưa chọn vị trí hợp lệ cho mã ${line.barcode}` };
    resolved.push({ line, locationId });
  }

  const minQty = await getNumberSetting("defaultMinQty");
  const doc = await db.$transaction(async (tx) => {
    const d = await createDoc(tx, "RECEIPT", warehouseId, user);
    for (const { line, locationId } of resolved) {
      await tx.stockItem.upsert({
        where: { locationId_barcode: { locationId, barcode: line.barcode } },
        update: { quantity: { increment: line.quantity } },
        create: { locationId, barcode: line.barcode, name: line.name, quantity: line.quantity, minQty },
      });
      await tx.stockLine.create({ data: { documentId: d.id, barcode: line.barcode, name: line.name, quantity: line.quantity, locationId } });
    }
    return d;
  });
  await writeAudit({ userId: user.id, action: "CREATE", entity: "StockDocument", entityId: doc.code, newValue: { lines: lines.length } });
  return { ok: true, data: { id: doc.id, code: doc.code } };
}

export interface IssueResult {
  id: number;
  code: string;
  lowStock: { barcode: string; name: string; quantity: number; minQty: number }[];
}

/** UC07 / FR08 – issue, optionally for a trip. Rejects the whole slip when any line exceeds stock (BR03, TC04). */
export async function createIssue(
  warehouseId: number, lines: IssueLineInput[], user: SessionUser, tripId?: number,
): Promise<CommandResult<IssueResult> & { shortages?: ShortageError[] }> {
  if (!lines.length) return { ok: false, status: 400, message: "Phiếu xuất chưa có dòng hàng" };
  if (lines.some((l) => !l.barcode || !isValidQty(l.quantity))) return { ok: false, status: 400, message: "Số lượng xuất phải là số nguyên dương" };

  const items = await db.stockItem.findMany({ where: { location: { warehouseId }, barcode: { in: lines.map((l) => l.barcode) } }, orderBy: { id: "asc" } });
  const available = new Map<string, number>();
  for (const it of items) available.set(it.barcode, (available.get(it.barcode) ?? 0) + it.quantity);
  const shortages = findShortages(lines, available);
  if (shortages.length) {
    const s = shortages[0];
    return { ok: false, status: 409, message: `Vượt số lượng tồn: ${s.barcode} yêu cầu ${s.requested}, tồn ${s.available} (BR03)`, shortages };
  }

  const doc = await db.$transaction(async (tx) => {
    const d = await createDoc(tx, "ISSUE", warehouseId, user, { tripId });
    for (const line of lines) {
      const locs = items.filter((i) => i.barcode === line.barcode);
      for (const { id, take } of allocate(line.quantity, locs)) {
        await tx.stockItem.update({ where: { id }, data: { quantity: { decrement: take } } });
        const it = locs.find((l) => l.id === id)!;
        it.quantity -= take;
        await tx.stockLine.create({ data: { documentId: d.id, barcode: line.barcode, name: it.name, quantity: take, locationId: it.locationId } });
      }
    }
    if (tripId) await startTrip(tx, tripId, user.username, `Xuất kho ${d.code}`);
    return d;
  });

  const touched = new Set(lines.map((l) => l.barcode));
  const totals = new Map<string, { name: string; quantity: number; minQty: number }>();
  for (const it of items.filter((i) => touched.has(i.barcode))) {
    const t = totals.get(it.barcode) ?? { name: it.name, quantity: 0, minQty: it.minQty };
    t.quantity += it.quantity;
    totals.set(it.barcode, t);
  }
  const lowStock = [...totals].filter(([, t]) => isLowStock(t.quantity, t.minQty)).map(([barcode, t]) => ({ barcode, ...t }));
  await writeAudit({ userId: user.id, action: "CREATE", entity: "StockDocument", entityId: doc.code, newValue: { lines: lines.length, tripId } });
  return { ok: true, data: { id: doc.id, code: doc.code, lowStock } };
}
