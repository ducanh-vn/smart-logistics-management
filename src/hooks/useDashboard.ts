"use client";
import { useState } from "react";
import type { DashboardData } from "@/types/report";
import { dayKey } from "@/lib/reports";
import { useFetch } from "./useFetch";

export function useDashboard() {
  const [date, setDate] = useState(dayKey(new Date()));
  const { data, loading, error } = useFetch<DashboardData>(`/api/reports/dashboard?date=${date}`);
  return { date, setDate, data, loading, error };
}
