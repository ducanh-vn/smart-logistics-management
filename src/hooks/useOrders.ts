"use client";
import { useMemo, useState } from "react";
import type { OrderStatus, OrderSummary } from "@/types/order";
import { useFetch } from "./useFetch";

export interface OrderListFilters {
  q: string;
  status: OrderStatus | "";
  warehouseId: string;
  page: number;
}

interface OrderPage {
  items: OrderSummary[];
  total: number;
  page: number;
  size: number;
}

/** Order list state: filters, paging, selection and reload. */
export function useOrders() {
  const [filters, setFilters] = useState<OrderListFilters>({ q: "", status: "", warehouseId: "", page: 1 });
  const [selected, setSelected] = useState<number[]>([]);
  const url = useMemo(() => {
    const p = new URLSearchParams({ page: String(filters.page), size: "20" });
    if (filters.q) p.set("q", filters.q);
    if (filters.status) p.set("status", filters.status);
    if (filters.warehouseId) p.set("warehouseId", filters.warehouseId);
    return `/api/orders?${p}`;
  }, [filters]);
  const { data, loading, reload } = useFetch<OrderPage>(url);

  const update = (patch: Partial<OrderListFilters>) => {
    setSelected([]);
    setFilters((f) => ({ ...f, ...patch, page: patch.page ?? 1 }));
  };
  const toggle = (id: number) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleAll = () => setSelected((s) => (data && s.length < data.items.length ? data.items.map((o) => o.id) : []));

  return { filters, update, data, loading, reload, selected, setSelected, toggle, toggleAll };
}
