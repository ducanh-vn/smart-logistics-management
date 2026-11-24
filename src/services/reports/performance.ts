import "server-only";
import { db } from "@/services/db";
import { aggregateByVehicle } from "@/lib/reports";
import { REPORT_MAX_DAYS } from "@/constants/reports";
import type { PerformanceReport } from "@/types/report";

const DAY = 86_400_000;

/** Parses yyyy-MM-dd range, defaulting to the last 7 days, capped at 31 days. */
export function parseRange(fromStr: string | null, toStr: string | null) {
  const today = new Date();
  const to = toStr ? new Date(`${toStr}T00:00:00`) : new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let from = fromStr ? new Date(`${fromStr}T00:00:00`) : new Date(to.getTime() - 6 * DAY);
  if (Number.isNaN(from.getTime()) || from > to) from = new Date(to.getTime() - 6 * DAY);
  if ((to.getTime() - from.getTime()) / DAY > REPORT_MAX_DAYS) from = new Date(to.getTime() - REPORT_MAX_DAYS * DAY);
  return { from, to: new Date(to.getTime() + DAY) };
}

/** UC17 / FR29 – distance, load used and cost per vehicle for completed or running trips. */
export async function getPerformance(from: Date, toExclusive: Date): Promise<PerformanceReport> {
  const trips = await db.trip.findMany({
    where: { date: { gte: from, lt: toExclusive } },
    include: { vehicle: true, _count: { select: { stops: true } } },
  });
  const rows = aggregateByVehicle(
    trips.map((t) => ({
      vehicleId: t.vehicleId, plate: t.vehicle.plate, type: t.vehicle.type, capacityKg: t.vehicle.capacityKg,
      totalKm: t.totalKm, totalKg: t.totalKg, stops: t._count.stops,
    })),
  );
  const sum = (k: "trips" | "stops" | "totalKm" | "totalKg" | "cost") => rows.reduce((s, r) => s + r[k], 0);
  const tripCount = sum("trips");
  return {
    from: from.toISOString(),
    to: new Date(toExclusive.getTime() - DAY).toISOString(),
    rows,
    totals: {
      trips: tripCount, stops: sum("stops"), totalKm: Math.round(sum("totalKm")), totalKg: Math.round(sum("totalKg")), cost: sum("cost"),
      loadFactor: tripCount ? rows.reduce((s, r) => s + r.loadFactor * r.trips, 0) / tripCount : 0,
    },
  };
}
