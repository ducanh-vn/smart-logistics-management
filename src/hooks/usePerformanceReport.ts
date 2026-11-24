"use client";
import { useState } from "react";
import type { PerformanceReport } from "@/types/report";
import { dayKey } from "@/lib/reports";
import { useFetch } from "./useFetch";

/** FR29 – date range state and the report for it; also builds the export links (FR30). */
export function usePerformanceReport() {
  const today = new Date();
  const [range, setRange] = useState({ from: dayKey(new Date(today.getTime() - 6 * 86_400_000)), to: dayKey(today) });
  const query = new URLSearchParams(range).toString();
  const { data, loading, error } = useFetch<PerformanceReport>(`/api/reports/performance?${query}`);
  return { range, setRange, data, loading, error, excelUrl: `/api/reports/performance/excel?${query}` };
}
