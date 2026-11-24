"use client";
import { useMemo, useState } from "react";
import type { AuditRow } from "@/types/admin";
import { useFetch } from "./useFetch";

interface AuditPage { items: AuditRow[]; total: number; page: number; size: number; entities: string[] }

export function useAudit() {
  const [filters, setFilters] = useState({ entity: "", q: "", page: 1 });
  const url = useMemo(() => `/api/admin/audit?${new URLSearchParams({ entity: filters.entity, q: filters.q, page: String(filters.page) })}`, [filters]);
  const { data, loading } = useFetch<AuditPage>(url);
  const update = (p: Partial<typeof filters>) => setFilters((f) => ({ ...f, ...p, page: p.page ?? 1 }));
  return { data, loading, filters, update };
}
