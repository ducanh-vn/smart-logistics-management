"use client";
import type { DriverRow, Shift } from "@/types/fleet";
import { useFetch } from "./useFetch";
import { useMutation } from "./useMutation";

/** Driver list with inline shift change (FR15). */
export function useDrivers() {
  const { data, loading, reload, setData } = useFetch<DriverRow[]>("/api/fleet/drivers");
  const call = useMutation<{ shift: Shift }>("", "PATCH");
  const setShift = async (id: number, shift: Shift) => {
    if (await call.run({ shift }, `/api/fleet/drivers/${id}`)) setData((list) => (list ?? []).map((d) => (d.id === id ? { ...d, shift } : d)));
  };
  return { drivers: data ?? [], loading, reload, setShift, error: call.error };
}
