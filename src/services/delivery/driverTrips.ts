import "server-only";
import { db } from "@/services/db";
import { startTrip } from "./lifecycle";
import type { CommandResult } from "@/services/orders/commands";
import type { DriverTrip } from "@/types/driver";
import type { OrderStatus } from "@/types/order";
import type { TripStatus } from "@/types/fleet";
import type { SessionUser } from "@/types/auth";

export const driverOf = (user: SessionUser) => db.driver.findUnique({ where: { userId: user.id } });

/** FR21 / TC32 – the driver's trips for today with stops in delivery order. */
export async function listDriverTrips(user: SessionUser): Promise<DriverTrip[]> {
  const driver = await driverOf(user);
  if (!driver) return [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const trips = await db.trip.findMany({
    where: { driverId: driver.id, date: { gte: start } },
    include: {
      vehicle: { select: { plate: true } },
      warehouse: { select: { name: true } },
      stops: { orderBy: { seq: "asc" }, include: { order: { include: { items: true } } } },
    },
    orderBy: { code: "asc" },
  });
  return trips.map((t) => ({
    id: t.id, code: t.code, status: t.status as TripStatus, plate: t.vehicle.plate, warehouseName: t.warehouse.name, totalKm: t.totalKm,
    stops: t.stops.map((s) => ({
      id: s.id, seq: s.seq, eta: s.eta?.toISOString() ?? null, orderId: s.orderId, orderCode: s.order.code,
      orderStatus: s.order.status as OrderStatus, receiverName: s.order.receiverName, receiverPhone: s.order.receiverPhone,
      address: s.order.address, district: s.order.district, lat: s.order.lat, lng: s.order.lng,
      weightKg: s.order.weightKg, fee: s.order.fee, items: s.order.items.map((i) => `${i.quantity} × ${i.name}`).join(", "),
      otpSent: !!s.otpSentAt, doneAt: s.doneAt?.toISOString() ?? null, failReason: s.failReason,
    })),
  }));
}

/** Driver presses "Bắt đầu chuyến" (goods already loaded). */
export async function startDriverTrip(tripId: number, user: SessionUser): Promise<CommandResult<{ status: string }>> {
  const driver = await driverOf(user);
  const trip = await db.trip.findUnique({ where: { id: tripId } });
  if (!driver || !trip || trip.driverId !== driver.id) return { ok: false, status: 404, message: "Không tìm thấy chuyến của bạn" };
  if (trip.status === "DONE") return { ok: false, status: 409, message: "Chuyến đã hoàn thành" };
  await db.$transaction((tx) => startTrip(tx, tripId, user.username, `Tài xế bắt đầu chuyến ${trip.code}`));
  return { ok: true, data: { status: "RUNNING" } };
}

/** FR23 – GPS fix from the driver's phone, stored for the vehicle of the running trip. */
export async function recordPosition(user: SessionUser, lat: number, lng: number, speedKmh = 0): Promise<CommandResult<{ vehicleId: number }>> {
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return { ok: false, status: 400, message: "Tọa độ không hợp lệ" };
  const driver = await driverOf(user);
  const trip = driver && (await db.trip.findFirst({ where: { driverId: driver.id, status: "RUNNING" } }));
  if (!trip) return { ok: false, status: 409, message: "Chưa có chuyến đang chạy" };
  await db.vehiclePosition.create({ data: { vehicleId: trip.vehicleId, lat, lng, speedKmh: Math.max(0, speedKmh) } });
  return { ok: true, data: { vehicleId: trip.vehicleId } };
}
