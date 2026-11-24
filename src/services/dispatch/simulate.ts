import "server-only";
import { db } from "@/services/db";
import { moveToward } from "@/lib/geo";
import { AVG_SPEED_KMH, GPS_INTERVAL_SECONDS } from "@/constants/business";

/** Distance a truck covers between two GPS fixes, exaggerated x3 so the demo map visibly moves. */
const STEP_KM = ((AVG_SPEED_KMH * GPS_INTERVAL_SECONDS) / 3600) * 3;

/**
 * Demo only: stands in for drivers' phones (FR23) by moving every running trip one GPS step
 * towards its next undelivered stop. The real app posts positions through /api/driver/position.
 */
export async function simulateGpsTick(): Promise<number> {
  const trips = await db.trip.findMany({
    where: { status: "RUNNING" },
    include: {
      warehouse: true,
      vehicle: { include: { positions: { orderBy: { recordedAt: "desc" }, take: 1 } } },
      stops: { where: { doneAt: null }, orderBy: { seq: "asc" }, take: 1, include: { order: { select: { lat: true, lng: true } } } },
    },
  });
  for (const t of trips) {
    const from = t.vehicle.positions[0] ?? t.warehouse;
    const target = t.stops[0]?.order ?? t.warehouse;
    const next = moveToward(from, target, STEP_KM);
    await db.vehiclePosition.create({ data: { vehicleId: t.vehicleId, lat: next.lat, lng: next.lng, speedKmh: AVG_SPEED_KMH } });
  }
  return trips.length;
}
