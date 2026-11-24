import "server-only";
import { db } from "@/services/db";
import { writeAudit } from "@/services/audit";
import { sendSms } from "@/services/notify/sms";
import { SMS_TEMPLATES } from "@/constants/delivery";
import type { CommandResult } from "@/services/orders/commands";
import { etas, tripCode, pathKm } from "@/lib/dispatch";
import { isDispatchable } from "@/lib/fleet";
import { DISPATCHABLE_ORDER_STATUSES } from "./plan";
import type { TripPayload, TripSummary } from "@/types/dispatch";
import type { TripStatus, VehicleStatus } from "@/types/fleet";
import type { SessionUser } from "@/types/auth";

const ACTIVE = ["NEW", "DISPATCHED", "RUNNING"];

/** Checks one trip against BR04, FR14 and order status before anything is written. */
async function validate(warehouseId: number, t: TripPayload): Promise<string | null> {
  const v = await db.vehicle.findUnique({ where: { id: t.vehicleId }, include: { trips: { where: { status: { in: ACTIVE } }, take: 1 } } });
  if (!v || !isDispatchable(v.status as VehicleStatus, v.nextServiceAt, new Date()) || v.trips.length) return `Xe ${v?.plate ?? t.vehicleId} không sẵn sàng (FR14)`;
  const d = await db.driver.findUnique({ where: { id: t.driverId }, include: { trips: { where: { status: { in: ACTIVE } }, take: 1 } } });
  if (!d || d.trips.length) return `Tài xế cho xe ${v.plate} không hợp lệ hoặc đang có chuyến`;
  const orders = await db.order.findMany({ where: { id: { in: t.orderIds } } });
  if (orders.length !== t.orderIds.length || orders.some((o) => o.warehouseId !== warehouseId || !DISPATCHABLE_ORDER_STATUSES.includes(o.status)))
    return `Có đơn trên xe ${v.plate} không còn ở trạng thái chờ phân xe`;
  const kg = orders.reduce((s, o) => s + o.weightKg, 0);
  const m3 = orders.reduce((s, o) => s + o.volumeM3, 0);
  if (kg > v.capacityKg || m3 > v.capacityM3) return `Xe ${v.plate} vượt tải trọng hoặc thể tích (BR04)`;
  return null;
}

/** FR19 – confirms the plan: creates trips and stops with ETA, orders become "Đã phân xe", trips are sent to drivers. */
export async function confirmTrips(warehouseId: number, trips: TripPayload[], user: SessionUser): Promise<CommandResult<{ codes: string[] }>> {
  const list = trips.filter((t) => t.orderIds.length);
  if (!list.length) return { ok: false, status: 400, message: "Chưa có chuyến nào để xác nhận" };
  const ids = list.flatMap((t) => t.orderIds);
  if (new Set(ids).size !== ids.length || new Set(list.map((t) => t.vehicleId)).size !== list.length || new Set(list.map((t) => t.driverId)).size !== list.length)
    return { ok: false, status: 400, message: "Mỗi đơn, xe và tài xế chỉ được dùng một lần" };
  for (const t of list) {
    const err = await validate(warehouseId, t);
    if (err) return { ok: false, status: 409, message: err };
  }
  const wh = (await db.warehouse.findUnique({ where: { id: warehouseId } }))!;
  const last = await db.trip.findFirst({ orderBy: { code: "desc" }, select: { code: true } });
  let seq = last ? Number(last.code.slice(2)) : 0;
  const now = new Date();
  const codes: string[] = [];

  await db.$transaction(async (tx) => {
    for (const t of list) {
      const orders = await tx.order.findMany({ where: { id: { in: t.orderIds } } });
      const ordered = t.orderIds.map((id) => orders.find((o) => o.id === id)!);
      const vehicle = (await tx.vehicle.findUnique({ where: { id: t.vehicleId } }))!;
      const code = tripCode(++seq);
      const eta = etas(wh, ordered, now);
      await tx.trip.create({
        data: {
          code, date: now, warehouseId, vehicleId: t.vehicleId, driverId: t.driverId, status: "DISPATCHED",
          totalKg: Math.round(ordered.reduce((s, o) => s + o.weightKg, 0) * 10) / 10,
          totalKm: Math.round(pathKm(wh, ordered) * 10) / 10,
          stops: { create: ordered.map((o, i) => ({ orderId: o.id, seq: i + 1, eta: eta[i] })) },
        },
      });
      for (const o of ordered) {
        await tx.order.update({ where: { id: o.id }, data: { status: "ASSIGNED", history: { create: { status: "ASSIGNED", actor: user.username, note: `Chuyến ${code} – xe ${vehicle.plate}` } } } });
        await sendSms(o.receiverPhone, SMS_TEMPLATES.assigned(o.code, vehicle.plate), o.id, tx);
      }
      await tx.vehicle.update({ where: { id: t.vehicleId }, data: { status: "ON_TRIP" } });
      codes.push(code);
    }
  }, { timeout: 30_000 });
  await writeAudit({ userId: user.id, action: "CREATE", entity: "Trip", entityId: codes.join(","), newValue: { warehouseId, trips: list.length, orders: ids.length } });
  return { ok: true, data: { codes } };
}

/** FR20 – today's trips with their stop path and latest vehicle position. */
export async function listTodayTrips(warehouseId?: number): Promise<TripSummary[]> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const trips = await db.trip.findMany({
    where: { date: { gte: start }, ...(warehouseId ? { warehouseId } : {}) },
    include: {
      vehicle: { select: { plate: true, positions: { orderBy: { recordedAt: "desc" }, take: 1 } } },
      driver: { select: { fullName: true } },
      stops: { orderBy: { seq: "asc" }, include: { order: { select: { code: true, lat: true, lng: true } } } },
    },
    orderBy: { code: "asc" },
  });
  return trips.map((t) => {
    const p = t.vehicle.positions[0];
    return {
      id: t.id, code: t.code, status: t.status as TripStatus, plate: t.vehicle.plate, vehicleId: t.vehicleId, driverName: t.driver.fullName,
      stopCount: t.stops.length, doneCount: t.stops.filter((s) => s.doneAt).length, totalKg: t.totalKg, totalKm: t.totalKm,
      path: t.stops.map((s) => ({ seq: s.seq, code: s.order.code, lat: s.order.lat, lng: s.order.lng, done: !!s.doneAt })),
      position: p && t.status === "RUNNING" ? { lat: p.lat, lng: p.lng, speedKmh: p.speedKmh, recordedAt: p.recordedAt.toISOString() } : null,
    };
  });
}
