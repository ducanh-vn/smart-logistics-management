"use client";
import { useMemo, useState } from "react";
import type { StockRow } from "@/types/warehouse";
import { useFetch } from "./useFetch";

export interface StockFilterState {
  q: string;
  location: string;
  lowOnly: boolean;
}

/** Stock list of one warehouse with search / location / low-stock filters. */
export function useStock(warehouseId: number | null) {
  const [filters, setFilters] = useState<StockFilterState>({ q: "", location: "", lowOnly: false });
  const url = useMemo(() => {
    if (!warehouseId) return null;
    const p = new URLSearchParams({ warehouseId: String(warehouseId) });
    if (filters.q) p.set("q", filters.q);
    if (filters.location) p.set("location", filters.location);
    if (filters.lowOnly) p.set("low", "1");
    return `/api/warehouse/stock?${p}`;
  }, [warehouseId, filters]);
  const { data, loading, reload } = useFetch<StockRow[]>(url);
  const update = (patch: Partial<StockFilterState>) => setFilters((f) => ({ ...f, ...patch }));
  return { rows: data ?? [], loading, reload, filters, update };
}

/** Barcode → stock rows lookup for the scanning forms. */
export function useStockLookup(warehouseId: number | null) {
  const { data, reload } = useFetch<StockRow[]>(warehouseId ? `/api/warehouse/stock?warehouseId=${warehouseId}` : null);
  const rows = data ?? [];
  const find = (barcode: string) => rows.filter((r) => r.barcode === barcode);
  return { rows, find, reload };
}
