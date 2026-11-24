"use client";
import { useEffect, useState } from "react";
import type { TripSummary } from "@/types/dispatch";
import { SIMULATE_EVERY_MS, TRACKING_POLL_MS } from "@/constants/dispatch";
import { useFetch } from "./useFetch";

/** FR20 – today's trips, refreshed every 10 s; optional demo GPS simulation. */
export function useTrips(warehouseId: number | null) {
  const { data, reload, loading } = useFetch<TripSummary[]>(warehouseId ? `/api/dispatch/trips?warehouseId=${warehouseId}` : null);
  const [simulating, setSimulating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const id = setInterval(() => { reload(); setLastUpdate(new Date()); }, simulating ? SIMULATE_EVERY_MS : TRACKING_POLL_MS);
    return () => clearInterval(id);
  }, [reload, simulating]);

  useEffect(() => {
    if (!simulating) return;
    const tick = () => fetch("/api/dispatch/simulate", { method: "POST" }).catch(() => undefined);
    tick();
    const id = setInterval(tick, SIMULATE_EVERY_MS);
    return () => clearInterval(id);
  }, [simulating]);

  return { trips: data ?? [], loading, reload, simulating, setSimulating, lastUpdate };
}
