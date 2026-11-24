import { describe, expect, it } from "vitest";
import type { DispatchPlan, PlanStop } from "@/types/dispatch";
import { autoAssignDrivers, etas, moveOrder, routeStats, shiftStop } from "./dispatch";

const depot = { lat: 20.974, lng: 105.863 };
const stop = (id: number, kg: number, lat = 20.99, lng = 105.85): PlanStop => ({
  orderId: id, code: `DH${id}`, receiverName: "A", address: "x", district: "Hoàng Mai", lat, lng, weightKg: kg, volumeM3: kg * 0.006,
});
const plan = (): DispatchPlan => ({
  warehouseId: 1, depot, elapsedMs: 10, unassigned: [stop(9, 50)],
  routes: [
    { vehicleId: 1, plate: "A", capacityKg: 100, capacityM3: 6, driverId: null, stops: [stop(1, 40), stop(2, 40, 21.0, 105.84)] },
    { vehicleId: 2, plate: "B", capacityKg: 100, capacityM3: 6, driverId: 7, stops: [stop(3, 30)] },
  ],
});

describe("dispatch plan editing (FR18)", () => {
  it("moves an order between vehicles and flags overload (BR04)", () => {
    const p = moveOrder(plan(), 3, 1);
    expect(p.routes[0].stops.map((s) => s.orderId)).toEqual([1, 2, 3]);
    expect(p.routes[1].stops).toHaveLength(0);
    expect(routeStats(depot, p.routes[0]).overloaded).toBe(true);
  });

  it("moves an unassigned order into a route and back", () => {
    const p = moveOrder(plan(), 9, 2);
    expect(p.unassigned).toHaveLength(0);
    expect(moveOrder(p, 9, null).unassigned.map((s) => s.orderId)).toEqual([9]);
  });

  it("reorders stops", () => {
    expect(shiftStop(plan(), 1, 1, -1).routes[0].stops.map((s) => s.orderId)).toEqual([2, 1]);
    expect(shiftStop(plan(), 1, 0, -1).routes[0].stops.map((s) => s.orderId)).toEqual([1, 2]);
  });

  it("assigns free drivers without reusing a chosen one", () => {
    expect(autoAssignDrivers(plan().routes, [7, 8]).map((r) => r.driverId)).toEqual([8, 7]);
  });

  it("ETA grows along the route", () => {
    const t = etas(depot, plan().routes[0].stops, new Date(2026, 10, 23, 8));
    expect(t[0].getTime()).toBeGreaterThan(new Date(2026, 10, 23, 8).getTime());
    expect(t[1].getTime()).toBeGreaterThan(t[0].getTime());
  });
});
