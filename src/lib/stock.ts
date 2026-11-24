import type { IssueLineInput, ShortageError } from "@/types/warehouse";
import { DOC_PREFIX } from "@/constants/warehouse";
import type { StockDocType } from "@/types/warehouse";

/** FR11 – stock is low when it falls below the minimum level. */
export const isLowStock = (quantity: number, minQty: number): boolean => quantity < minQty;

/** Sums the requested quantity per barcode (the same SKU can be scanned many times). */
export function mergeLines(lines: IssueLineInput[]): Map<string, number> {
  const merged = new Map<string, number>();
  for (const l of lines) merged.set(l.barcode, (merged.get(l.barcode) ?? 0) + l.quantity);
  return merged;
}

/** BR03 – returns every line whose request exceeds the available stock. */
export function findShortages(lines: IssueLineInput[], available: Map<string, number>): ShortageError[] {
  const out: ShortageError[] = [];
  for (const [barcode, requested] of mergeLines(lines)) {
    const have = available.get(barcode) ?? 0;
    if (requested > have) out.push({ barcode, requested, available: have });
  }
  return out;
}

/**
 * Splits an issue of `requested` units over locations (in the given order).
 * Returns how much to take from each location; assumes the total is sufficient.
 */
export function allocate(requested: number, locations: { id: number; quantity: number }[]): { id: number; take: number }[] {
  const plan: { id: number; take: number }[] = [];
  let left = requested;
  for (const loc of locations) {
    if (left <= 0) break;
    const take = Math.min(left, loc.quantity);
    if (take > 0) plan.push({ id: loc.id, take });
    left -= take;
  }
  return plan;
}

/** FR09 – signed difference between counted and system quantity. */
export const stocktakeDiff = (system: number, counted: number): number => counted - system;

export const docCode = (type: StockDocType, seq: number): string => `${DOC_PREFIX[type]}${String(seq).padStart(6, "0")}`;

/** Validates a quantity typed or scanned by the storekeeper. */
export const isValidQty = (q: number, allowZero = false): boolean => Number.isInteger(q) && (allowZero ? q >= 0 : q > 0);
