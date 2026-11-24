import "server-only";
import { db } from "@/services/db";
import { isLowStock } from "@/lib/stock";
import type { StockDocDetail, StockDocStatus, StockDocSummary, StockDocType, StockRow, TripRef } from "@/types/warehouse";

export interface StockFilters {
  warehouseId: number;
  q?: string;
  location?: string;
  lowOnly?: boolean;
}

/** FR07/FR10/FR11 – stock per location with low-stock flag; search by barcode, name or location (TC23). */
export async function listStock(f: StockFilters): Promise<StockRow[]> {
  const rows = await db.stockItem.findMany({
    where: {
      location: { warehouseId: f.warehouseId, ...(f.location ? { code: { startsWith: f.location.toUpperCase() } } : {}) },
      ...(f.q ? { OR: [{ barcode: { contains: f.q, mode: "insensitive" as const } }, { name: { contains: f.q, mode: "insensitive" as const } }] } : {}),
    },
    include: { location: { select: { code: true } } },
    orderBy: [{ barcode: "asc" }, { locationId: "asc" }],
  });
  const mapped = rows.map((r) => ({
    id: r.id, barcode: r.barcode, name: r.name, quantity: r.quantity, minQty: r.minQty,
    locationCode: r.location.code, isLow: isLowStock(r.quantity, r.minQty), updatedAt: r.updatedAt.toISOString(),
  }));
  return f.lowOnly ? mapped.filter((r) => r.isLow) : mapped;
}

/** All location codes of a warehouse with the number of SKUs stored (FR10). */
export async function listLocations(warehouseId: number) {
  const locs = await db.location.findMany({ where: { warehouseId }, include: { _count: { select: { stockItems: true } } }, orderBy: { code: "asc" } });
  return locs.map((l) => ({ code: l.code, skuCount: l._count.stockItems }));
}

const docInclude = { trip: { select: { code: true } }, lines: true } as const;

type DocRow = Awaited<ReturnType<typeof db.stockDocument.findMany<{ include: typeof docInclude }>>>[number];

const toSummary = (d: DocRow): StockDocSummary => ({
  id: d.id, code: d.code, type: d.type as StockDocType, status: d.status as StockDocStatus, createdBy: d.createdBy,
  createdAt: d.createdAt.toISOString(), tripCode: d.trip?.code ?? null, lineCount: d.lines.length,
  totalQty: d.lines.reduce((s, l) => s + l.quantity, 0),
});

export async function listDocuments(warehouseId: number, type?: StockDocType): Promise<StockDocSummary[]> {
  const docs = await db.stockDocument.findMany({
    where: { warehouseId, ...(type ? { type } : {}) },
    include: docInclude,
    orderBy: { id: "desc" },
    take: 100,
  });
  return docs.map(toSummary);
}

/** Document with lines and location codes, used by the detail view and the print page (FR12). */
export async function getDocument(id: number): Promise<StockDocDetail | null> {
  const d = await db.stockDocument.findUnique({ where: { id }, include: { ...docInclude, warehouse: true } });
  if (!d) return null;
  const locIds = d.lines.map((l) => l.locationId).filter((x): x is number => x !== null);
  const locs = await db.location.findMany({ where: { id: { in: locIds } }, select: { id: true, code: true } });
  const codeOf = new Map(locs.map((l) => [l.id, l.code]));
  return {
    ...toSummary(d),
    warehouse: { code: d.warehouse.code, name: d.warehouse.name, address: d.warehouse.address },
    lines: d.lines.map((l) => ({ id: l.id, barcode: l.barcode, name: l.name, quantity: l.quantity, locationCode: l.locationId ? codeOf.get(l.locationId) ?? null : null })),
  };
}

/** Trips of this warehouse that still need goods issued (FR08). */
export async function listIssuableTrips(warehouseId: number): Promise<TripRef[]> {
  const trips = await db.trip.findMany({
    where: { warehouseId, status: { in: ["NEW", "DISPATCHED"] }, documents: { none: { type: "ISSUE" } } },
    include: { vehicle: { select: { plate: true } }, _count: { select: { stops: true } } },
    orderBy: { id: "desc" },
    take: 50,
  });
  return trips.map((t) => ({ id: t.id, code: t.code, plate: t.vehicle.plate, orderCount: t._count.stops }));
}
