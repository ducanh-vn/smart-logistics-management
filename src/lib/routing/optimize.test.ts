import { describe, expect, it } from "vitest";
import { optimizeRoutes } from "./optimize";
import { twoOpt } from "./twoOpt";
import { buildDistanceMatrix, routeLength } from "./distanceMatrix";
import { createRandom } from "@/lib/mock/random";
import { DISTRICTS } from "@/constants/districts";
import type { RouteStop, RouteVehicle } from "@/types/routing";

const depot = { lat: 20.9685, lng: 105.8585 };

function makeStops(n: number, seed = 1): RouteStop[] {
  const r = createRandom(seed);
  return Array.from({ length: n }, (_, i) => {
    const d = r.pick(DISTRICTS.filter((x) => x.zone === "URBAN"));
    const weightKg = r.int(5, 60);
    return { orderId: i + 1, lat: r.jitter(d.lat, 0.02), lng: r.jitter(d.lng, 0.02), weightKg, volumeM3: weightKg * 0.006, district: d.name };
  });
}
const fleet = (n: number): RouteVehicle[] =>
  Array.from({ length: n }, (_, i) => ({ vehicleId: i + 1, capacityKg: [1000, 1500, 2500][i % 3], capacityM3: [6, 9, 14][i % 3] }));

describe("optimizeRoutes", () => {
  it("TC03: 50 orders, 5 vehicles – every order handled once, no vehicle overloaded (BR04)", () => {
    const stops = makeStops(50);
    const res = optimizeRoutes(depot, stops, fleet(5));
    const seen = [...res.routes.flatMap((r) => r.orderIds), ...res.unassigned].sort((a, b) => a - b);
    expect(seen).toEqual(stops.map((s) => s.orderId));
    for (const route of res.routes) {
      const v = fleet(5).find((x) => x.vehicleId === route.vehicleId)!;
      expect(route.totalKg).toBeLessThanOrEqual(v.capacityKg);
    }
  });

  it("TC28: orders that exceed the fleet capacity are reported as unassigned", () => {
    const stops = makeStops(20).map((s) => ({ ...s, weightKg: 160 }));
    const vehicles = [
      { vehicleId: 1, capacityKg: 1500, capacityM3: 30 },
      { vehicleId: 2, capacityKg: 1500, capacityM3: 30 },
    ];
    const res = optimizeRoutes(depot, stops, vehicles);
    expect(res.unassigned.length).toBeGreaterThan(0);
    for (const r of res.routes) expect(r.totalKg).toBeLessThanOrEqual(1500);
  });

  it("TC29 / NFR02: 100 stops and 10 vehicles in under 30 seconds", () => {
    const res = optimizeRoutes(depot, makeStops(100, 7), fleet(10));
    expect(res.elapsedMs).toBeLessThan(30_000);
    expect(res.routes.length).toBeGreaterThan(0);
  });

  it("2-opt never makes a route longer", () => {
    const stops = makeStops(15, 3);
    const m = buildDistanceMatrix(depot, stops);
    const route = stops.map((_, i) => i + 1);
    const improved = twoOpt(route, m, Date.now() + 1000);
    expect(routeLength(improved, m)).toBeLessThanOrEqual(routeLength(route, m));
    expect([...improved].sort((a, b) => a - b)).toEqual(route);
  });

  it("respects the per-trip stop limit (one driver shift)", () => {
    const stops = makeStops(60).map((s) => ({ ...s, weightKg: 5, volumeM3: 0.03 }));
    const res = optimizeRoutes(depot, stops, fleet(5), { timeLimitMs: 5000, maxStopsPerRoute: 20 });
    expect(res.routes.every((r) => r.orderIds.length <= 20)).toBe(true);
    expect(res.routes.reduce((n, r) => n + r.orderIds.length, 0) + res.unassigned.length).toBe(60);
  });
});
