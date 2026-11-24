import "server-only";
import { db } from "@/services/db";
import { dayKey, isOnTime, rate } from "@/lib/reports";
import { TREND_DAYS } from "@/constants/reports";
import type { DashboardData } from "@/types/report";
import type { OrderStatus } from "@/types/order";

const DAY = 86_400_000;
const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** UC16 / FR28 – figures for one day plus a 7-day trend; every number comes straight from the DB (TC39). */
export async function getDashboard(date: Date): Promise<DashboardData> {
  const from = startOf(date);
  const to = new Date(from.getTime() + DAY);
  const trendFrom = new Date(from.getTime() - (TREND_DAYS - 1) * DAY);

  const [byStatus, created, stops, trips, totalVehicles] = await Promise.all([
    db.order.groupBy({ by: ["status"], where: { createdAt: { gte: from, lt: to } }, _count: true }),
    db.order.findMany({ where: { createdAt: { gte: trendFrom, lt: to } }, select: { createdAt: true } }),
    db.stop.findMany({
      where: { doneAt: { gte: trendFrom, lt: to }, order: { status: "DELIVERED" }, failReason: null },
      select: { doneAt: true, order: { select: { expectedDate: true } } },
    }),
    db.trip.findMany({ where: { date: { gte: from, lt: to } }, select: { vehicleId: true, totalKm: true } }),
    db.vehicle.count(),
  ]);

  const trend = Array.from({ length: TREND_DAYS }, (_, i) => {
    const day = dayKey(new Date(trendFrom.getTime() + i * DAY));
    const done = stops.filter((s) => dayKey(s.doneAt!) === day);
    return {
      day,
      created: created.filter((o) => dayKey(o.createdAt) === day).length,
      delivered: done.length,
      onTimeRate: rate(done.filter((s) => isOnTime(s.doneAt!, s.order.expectedDate)).length, done.length),
    };
  });
  const today = trend[trend.length - 1];

  return {
    date: dayKey(from),
    ordersByStatus: byStatus.map((g) => ({ status: g.status as OrderStatus, count: g._count })),
    totalOrders: byStatus.reduce((s, g) => s + g._count, 0),
    delivered: today.delivered,
    onTimeRate: today.onTimeRate,
    activeVehicles: new Set(trips.map((t) => t.vehicleId)).size,
    totalVehicles,
    trips: trips.length,
    totalKm: Math.round(trips.reduce((s, t) => s + t.totalKm, 0)),
    trend,
  };
}
