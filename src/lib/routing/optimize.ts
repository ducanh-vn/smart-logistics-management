import type { GeoPoint, PlannedRoute, RouteStop, RouteVehicle, RoutingOptions, RoutingResult } from "@/types/routing";
import { MAX_STOPS_PER_TRIP, ROUTE_TIME_LIMIT_MS } from "@/constants/business";
import { buildDistanceMatrix, routeLength } from "./distanceMatrix";
import { clarkeWright } from "./savings";
import { twoOpt } from "./twoOpt";

const round1 = (x: number) => Math.round(x * 10) / 10;

/**
 * Route optimization (design doc SLMS-TK-01, section 5):
 * distance matrix -> cluster by area -> Clarke–Wright savings -> 2-opt, within a time limit.
 * Heterogeneous fleet: routes are built for the largest remaining vehicle, the fullest route is
 * assigned to the smallest vehicle that can carry it, and the process repeats.
 */
export function optimizeRoutes(
  depot: GeoPoint,
  stops: RouteStop[],
  vehicles: RouteVehicle[],
  options: RoutingOptions = { timeLimitMs: ROUTE_TIME_LIMIT_MS, maxStopsPerRoute: MAX_STOPS_PER_TRIP },
): RoutingResult {
  const started = Date.now();
  const deadline = started + options.timeLimitMs;
  const m = buildDistanceMatrix(depot, stops);
  const kg = (r: number[]) => r.reduce((s, i) => s + stops[i - 1].weightKg, 0);
  const m3 = (r: number[]) => r.reduce((s, i) => s + stops[i - 1].volumeM3, 0);

  let remaining = stops.map((_, i) => i + 1);
  const freeVehicles = [...vehicles].sort((a, b) => a.capacityKg - b.capacityKg);
  const planned: { vehicle: RouteVehicle; route: number[] }[] = [];

  while (remaining.length && freeVehicles.length && Date.now() < deadline) {
    const largest = freeVehicles[freeVehicles.length - 1];
    const sub = remaining.map((i) => stops[i - 1]);
    const subM = [0, ...remaining].map((i) => [0, ...remaining].map((j) => m[i][j]));
    const routes = clarkeWright(sub, subM, { kg: largest.capacityKg, m3: largest.capacityM3, stops: options.maxStopsPerRoute })
      .map((r) => r.map((k) => remaining[k - 1]))
      .filter((r) => kg(r) <= largest.capacityKg && m3(r) <= largest.capacityM3);
    if (!routes.length) break; // every remaining stop is heavier than any vehicle
    routes.sort((a, b) => kg(b) - kg(a));
    const route = routes[0];
    const vIdx = freeVehicles.findIndex((v) => v.capacityKg >= kg(route) && v.capacityM3 >= m3(route));
    planned.push({ vehicle: freeVehicles[vIdx], route });
    freeVehicles.splice(vIdx, 1);
    const used = new Set(route);
    remaining = remaining.filter((i) => !used.has(i));
  }

  const result: PlannedRoute[] = planned.map(({ vehicle, route }) => {
    const improved = twoOpt(route, m, deadline);
    return {
      vehicleId: vehicle.vehicleId,
      orderIds: improved.map((i) => stops[i - 1].orderId),
      totalKg: round1(kg(improved)),
      totalM3: Math.round(m3(improved) * 1000) / 1000,
      distanceKm: round1(routeLength(improved, m)),
    };
  });

  return {
    routes: result,
    unassigned: remaining.map((i) => stops[i - 1].orderId),
    totalKm: round1(result.reduce((s, r) => s + r.distanceKm, 0)),
    elapsedMs: Date.now() - started,
  };
}
