"use client";
import { useEffect, useState } from "react";
import type { DriverTrip } from "@/types/driver";
import { TRACKING_POLL_MS } from "@/constants/dispatch";
import { useFetch } from "./useFetch";
import { useMutation } from "./useMutation";

/** FR21 – the driver's trips today; refreshed every 10 s so new orders arrive quickly (TC31). */
export function useDriverTrips() {
  const { data, loading, reload, error } = useFetch<DriverTrip[]>("/api/driver/trips");
  const [pickedId, setPickedId] = useState<number | null>(null);
  const startCall = useMutation<Record<string, never>>("", "POST");

  useEffect(() => {
    const id = setInterval(reload, TRACKING_POLL_MS);
    return () => clearInterval(id);
  }, [reload]);

  const trips = data ?? [];
  const active = trips.find((t) => t.id === pickedId) ?? trips.find((t) => t.status !== "DONE") ?? trips[0] ?? null;
  const start = async () => {
    if (active && (await startCall.run({}, `/api/driver/trips/${active.id}/start`))) reload();
  };
  return { trips, trip: active, pick: setPickedId, loading, error: error ?? startCall.error, reload, start, starting: startCall.loading };
}
