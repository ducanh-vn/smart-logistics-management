import type { VehiclePerformance } from "@/types/report";
import { COST_PER_KM, DEFAULT_COST_PER_KM } from "@/constants/reports";

/** On time = delivered no later than the promised date/time of the order. */
export const isOnTime = (doneAt: Date, expectedDate: Date): boolean => doneAt.getTime() <= expectedDate.getTime();

export function rate(part: number, total: number): number | null {
  return total > 0 ? part / total : null;
}

export const tripCost = (km: number, vehicleType: string): number => Math.round(km * (COST_PER_KM[vehicleType] ?? DEFAULT_COST_PER_KM));

/** Local yyyy-MM-dd key of a date (used to bucket by day). */
export const dayKey = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

interface TripRow {
  vehicleId: number;
  plate: string;
  type: string;
  capacityKg: number;
  totalKm: number;
  totalKg: number;
  stops: number;
}

/** FR29 – aggregates trips per vehicle; sorted by cost, highest first. */
export function aggregateByVehicle(trips: TripRow[]): VehiclePerformance[] {
  const map = new Map<number, VehiclePerformance & { loadSum: number }>();
  for (const t of trips) {
    const row = map.get(t.vehicleId) ?? {
      vehicleId: t.vehicleId, plate: t.plate, type: t.type, capacityKg: t.capacityKg,
      trips: 0, stops: 0, totalKm: 0, totalKg: 0, loadFactor: 0, cost: 0, costPerStop: 0, loadSum: 0,
    };
    row.trips += 1;
    row.stops += t.stops;
    row.totalKm += t.totalKm;
    row.totalKg += t.totalKg;
    row.cost += tripCost(t.totalKm, t.type);
    row.loadSum += t.capacityKg > 0 ? t.totalKg / t.capacityKg : 0;
    map.set(t.vehicleId, row);
  }
  return [...map.values()]
    .map(({ loadSum, ...r }) => ({
      ...r,
      totalKm: Math.round(r.totalKm * 10) / 10,
      totalKg: Math.round(r.totalKg),
      loadFactor: r.trips ? loadSum / r.trips : 0,
      costPerStop: r.stops ? Math.round(r.cost / r.stops) : 0,
    }))
    .sort((a, b) => b.cost - a.cost);
}
