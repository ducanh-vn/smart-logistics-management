import { describe, expect, it } from "vitest";
import { aggregateByVehicle, isOnTime, rate, tripCost } from "./reports";

describe("report calculations (FR28, FR29)", () => {
  it("on-time and rate", () => {
    expect(isOnTime(new Date(2026, 10, 23, 15), new Date(2026, 10, 24, 7))).toBe(true);
    expect(isOnTime(new Date(2026, 10, 24, 10), new Date(2026, 10, 24, 7))).toBe(false);
    expect(rate(19, 20)).toBe(0.95);
    expect(rate(0, 0)).toBeNull();
  });

  it("TC40: km, load and cost per vehicle", () => {
    const rows = aggregateByVehicle([
      { vehicleId: 1, plate: "A", type: "Tải 1 tấn", capacityKg: 1000, totalKm: 40, totalKg: 800, stops: 20 },
      { vehicleId: 1, plate: "A", type: "Tải 1 tấn", capacityKg: 1000, totalKm: 20, totalKg: 600, stops: 10 },
      { vehicleId: 2, plate: "B", type: "Tải 2,5 tấn", capacityKg: 2500, totalKm: 50, totalKg: 2000, stops: 30 },
    ]);
    expect(rows[0].plate).toBe("B");
    const a = rows.find((r) => r.plate === "A")!;
    expect(a).toMatchObject({ trips: 2, stops: 30, totalKm: 60, totalKg: 1400, cost: 360_000, costPerStop: 12_000 });
    expect(a.loadFactor).toBeCloseTo(0.7);
    expect(tripCost(10, "không rõ")).toBe(75_000);
  });
});
