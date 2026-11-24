import type { DispatchPlan, PlanRoute, PlanStop, RouteStats } from "@/types/dispatch";
import type { GeoPoint } from "@/types/routing";
import { roadKm } from "./geo";
import { AVG_SPEED_KMH, SERVICE_MINUTES } from "@/constants/business";

const round1 = (x: number) => Math.round(x * 10) / 10;

/** Depot -> stops -> depot distance in road km. */
export function pathKm(depot: GeoPoint, stops: GeoPoint[]): number {
  let km = 0;
  let prev = depot;
  for (const s of stops) { km += roadKm(prev, s); prev = s; }
  return stops.length ? km + roadKm(prev, depot) : 0;
}

/** Load, distance and duration of one route; overloaded = BR04 violated (possible after manual edits). */
export function routeStats(depot: GeoPoint, r: PlanRoute): RouteStats {
  const totalKg = r.stops.reduce((s, x) => s + x.weightKg, 0);
  const totalM3 = r.stops.reduce((s, x) => s + x.volumeM3, 0);
  const distanceKm = pathKm(depot, r.stops);
  return {
    totalKg: round1(totalKg),
    totalM3: Math.round(totalM3 * 100) / 100,
    distanceKm: round1(distanceKm),
    durationMin: Math.round((distanceKm / AVG_SPEED_KMH) * 60 + r.stops.length * SERVICE_MINUTES),
    overloaded: totalKg > r.capacityKg || totalM3 > r.capacityM3,
  };
}

/** Expected arrival time at each stop, leaving the depot at `start`. */
export function etas(depot: GeoPoint, stops: GeoPoint[], start: Date): Date[] {
  const out: Date[] = [];
  let t = start.getTime();
  let prev = depot;
  for (const s of stops) {
    t += (roadKm(prev, s) / AVG_SPEED_KMH) * 3_600_000;
    out.push(new Date(t));
    t += SERVICE_MINUTES * 60_000;
    prev = s;
  }
  return out;
}

/** FR18 – move an order to another vehicle (appended) or to the unassigned list (target null). */
export function moveOrder(plan: DispatchPlan, orderId: number, toVehicleId: number | null): DispatchPlan {
  let moved: PlanStop | undefined;
  const take = (stops: PlanStop[]) => stops.filter((s) => (s.orderId === orderId ? ((moved = s), false) : true));
  const routes = plan.routes.map((r) => ({ ...r, stops: take(r.stops) }));
  let unassigned = take(plan.unassigned);
  if (!moved) return plan;
  if (toVehicleId === null) unassigned = [...unassigned, moved];
  else {
    const target = routes.find((r) => r.vehicleId === toVehicleId);
    if (!target) return plan;
    target.stops = [...target.stops, moved];
  }
  return { ...plan, routes, unassigned };
}

/** FR18 – move a stop one place up (-1) or down (+1) within its route. */
export function shiftStop(plan: DispatchPlan, vehicleId: number, index: number, delta: -1 | 1): DispatchPlan {
  return {
    ...plan,
    routes: plan.routes.map((r) => {
      const j = index + delta;
      if (r.vehicleId !== vehicleId || j < 0 || j >= r.stops.length) return r;
      const stops = [...r.stops];
      [stops[index], stops[j]] = [stops[j], stops[index]];
      return { ...r, stops };
    }),
  };
}

/** Pairs each route with a free driver, keeping any choice already made. */
export function autoAssignDrivers(routes: PlanRoute[], freeDriverIds: number[]): PlanRoute[] {
  const taken = new Set(routes.map((r) => r.driverId).filter((x): x is number => x !== null));
  const pool = freeDriverIds.filter((id) => !taken.has(id));
  return routes.map((r) => (r.driverId !== null ? r : { ...r, driverId: pool.shift() ?? null }));
}

export const tripCode = (seq: number): string => `CX${String(seq).padStart(6, "0")}`;
