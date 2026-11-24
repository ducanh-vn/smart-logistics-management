"use client";
import type { VehicleRow } from "@/types/fleet";
import { useFetch } from "./useFetch";
import { useMutation } from "./useMutation";

/** Vehicle list plus the maintenance start/finish action (FR13/FR14). */
export function useVehicles() {
  const { data, loading, reload } = useFetch<VehicleRow[]>("/api/fleet/vehicles");
  const call = useMutation<{ action: "START" | "FINISH" }>("", "POST");
  const maintenance = async (id: number, action: "START" | "FINISH") => {
    if (await call.run({ action }, `/api/fleet/vehicles/${id}/maintenance`)) reload();
  };
  return { vehicles: data ?? [], loading, reload, maintenance, error: call.error, busy: call.loading };
}
