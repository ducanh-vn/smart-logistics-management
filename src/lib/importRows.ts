import { IMPORT_COLUMNS, type ImportColumnKey } from "@/constants/importTemplate";

export type ImportRow = Record<ImportColumnKey, string>;

/** Converts one sheet row (array of cell values, 0-based) to an import record. */
export function toImportRow(cells: unknown[]): ImportRow {
  const row = {} as ImportRow;
  IMPORT_COLUMNS.forEach((c, i) => {
    const v = cells[i];
    const text = v && typeof v === "object" && "text" in (v as object) ? (v as { text: string }).text : v;
    row[c.key] = text === undefined || text === null ? "" : String(text).trim();
  });
  if (/^\d{9}$/.test(row.receiverPhone)) row.receiverPhone = "0" + row.receiverPhone; // Excel drops leading zero
  return row;
}

export const isEmptyRow = (r: ImportRow) => Object.values(r).every((v) => !v);
