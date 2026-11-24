import "server-only";
import { db } from "@/services/db";
import { listVehicles } from "@/services/fleet/vehicles";
import { listDrivers } from "@/services/fleet/drivers";
import { optimizeRoutes } from "@/lib/routing/optimize";
import { autoAssignDrivers } from "@/lib/dispatch";
import type { DispatchPlan, PlanStop } from "@/types/dispatch";
import type { DriverRow, VehicleRow } from "@/types/fleet";

/** Orders that may be put on a trip: approved, or waiting for redelivery (BR06). */
export const DISPATCHABLE_ORDER_STATUSES = ["APPROVED", "RETRY"];

export async function dispatchableOrders(warehouseId: number): Promise<PlanStop[]> {
  const orders = await db.order.findMany({ where: { warehouseId, status: { in: DISPATCHABLE_ORDER_STATUSES } }, orderBy: { id: "asc" } });
  return orders.map((o) => ({
    orderId: o.id, code: o.code, receiverName: o.receiverName, address: o.address, district: o.district,
    lat: o.lat, lng: o.lng, weightKg: o.weightKg, volumeM3: o.volumeM3,
  }));
}

/** Everything the dispatch screen needs before optimizing. */
export async function dispatchResources(warehouseId: number): Promise<{ orders: PlanStop[]; vehicles: VehicleRow[]; drivers: DriverRow[] }> {
  const [orders, vehicles, drivers] = await Promise.all([dispatchableOrders(warehouseId), listVehicles(), listDrivers()]);
  return { orders, vehicles: vehicles.filter((v) => v.dispatchable), drivers: drivers.filter((d) => !d.busy) };
}

/** UC10 / FR16–FR17 – runs the optimizer on the chosen orders and vehicles; nothing is saved yet. */
export async function buildPlan(warehouseId: number, orderIds?: number[], vehicleIds?: number[]): Promise<DispatchPlan | null> {
  const wh = await db.warehouse.findUnique({ where: { id: warehouseId } });
  if (!wh) return null;
  const res = await dispatchResources(warehouseId);
  const orders = orderIds?.length ? res.orders.filter((o) => orderIds.includes(o.orderId)) : res.orders;
  const vehicles = vehicleIds?.length ? res.vehicles.filter((v) => vehicleIds.includes(v.id)) : res.vehicles;
  const depot = { lat: wh.lat, lng: wh.lng };

  const result = optimizeRoutes(
    depot,
    orders.map((o) => ({ orderId: o.orderId, lat: o.lat, lng: o.lng, weightKg: o.weightKg, volumeM3: o.volumeM3, district: o.district })),
    vehicles.map((v) => ({ vehicleId: v.id, capacityKg: v.capacityKg, capacityM3: v.capacityM3 })),
  );
  const byId = new Map(orders.map((o) => [o.orderId, o]));
  const vById = new Map(vehicles.map((v) => [v.id, v]));
  const routes = result.routes.map((r) => {
    const v = vById.get(r.vehicleId)!;
    return { vehicleId: v.id, plate: v.plate, capacityKg: v.capacityKg, capacityM3: v.capacityM3, driverId: null, stops: r.orderIds.map((id) => byId.get(id)!) };
  });
  const hour = new Date().getHours();
  const preferred = [...res.drivers].sort((a, b) => Number(b.shift === (hour < 12 ? "MORNING" : "AFTERNOON")) - Number(a.shift === (hour < 12 ? "MORNING" : "AFTERNOON")));
  return {
    warehouseId, depot, elapsedMs: result.elapsedMs,
    routes: autoAssignDrivers(routes, preferred.map((d) => d.id)),
    unassigned: result.unassigned.map((id) => byId.get(id)!),
  };
}
