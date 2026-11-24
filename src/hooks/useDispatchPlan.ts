"use client";
import { useEffect, useState } from "react";
import type { DispatchPlan, PlanStop } from "@/types/dispatch";
import type { DriverRow, VehicleRow } from "@/types/fleet";
import { moveOrder, shiftStop } from "@/lib/dispatch";
import { useFetch } from "./useFetch";
import { useMutation } from "./useMutation";

interface Resources {
  orders: PlanStop[];
  vehicles: VehicleRow[];
  drivers: DriverRow[];
}

/** UC10 state: resources, optimize, manual edits (FR18) and confirmation (FR19). */
export function useDispatchPlan(warehouseId: number | null) {
  const res = useFetch<Resources>(warehouseId ? `/api/dispatch/resources?warehouseId=${warehouseId}` : null);
  const optimizeCall = useMutation<{ warehouseId: number; orderIds?: number[]; vehicleIds?: number[] }, DispatchPlan>("/api/dispatch/optimize");
  const confirmCall = useMutation<unknown, { codes: string[] }>("/api/dispatch/trips");
  const [plan, setPlan] = useState<DispatchPlan | null>(null);
  const [vehicleIds, setVehicleIds] = useState<number[]>([]);
  const [orderLimit, setOrderLimit] = useState(0);
  const [done, setDone] = useState<string[] | null>(null);

  useEffect(() => { setPlan(null); setDone(null); setVehicleIds([]); setOrderLimit(0); }, [warehouseId]);

  const orders = res.data?.orders ?? [];
  const optimize = async () => {
    if (!warehouseId) return;
    setDone(null);
    const orderIds = orderLimit > 0 ? orders.slice(0, orderLimit).map((o) => o.orderId) : undefined;
    const p = await optimizeCall.run({ warehouseId, orderIds, vehicleIds: vehicleIds.length ? vehicleIds : undefined });
    if (p) setPlan(p);
  };

  const confirm = async () => {
    if (!plan) return;
    const trips = plan.routes.filter((r) => r.stops.length).map((r) => ({ vehicleId: r.vehicleId, driverId: r.driverId, orderIds: r.stops.map((s) => s.orderId) }));
    const out = await confirmCall.run({ warehouseId: plan.warehouseId, trips });
    if (out) { setDone(out.codes); setPlan(null); res.reload(); }
  };

  const edit = {
    move: (orderId: number, to: number | null) => setPlan((p) => (p ? moveOrder(p, orderId, to) : p)),
    shift: (vehicleId: number, index: number, delta: -1 | 1) => setPlan((p) => (p ? shiftStop(p, vehicleId, index, delta) : p)),
    setDriver: (vehicleId: number, driverId: number) =>
      setPlan((p) => (p ? { ...p, routes: p.routes.map((r) => (r.vehicleId === vehicleId ? { ...r, driverId } : r)) } : p)),
  };

  const toggleVehicle = (id: number) => setVehicleIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  return {
    orders, vehicles: res.data?.vehicles ?? [], drivers: res.data?.drivers ?? [], loading: res.loading,
    vehicleIds, setVehicleIds, toggleVehicle, orderLimit, setOrderLimit,
    plan, setPlan, optimize, optimizing: optimizeCall.loading, confirm, confirming: confirmCall.loading,
    error: optimizeCall.error ?? confirmCall.error, done, edit,
  };
}
