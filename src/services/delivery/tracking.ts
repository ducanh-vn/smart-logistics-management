import "server-only";
import { db } from "@/services/db";
import type { TrackingResult } from "@/types/driver";
import type { OrderStatus } from "@/types/order";

const maskName = (name: string) => name.split(" ").map((w, i, a) => (i === a.length - 1 ? w : `${w[0]}.`)).join(" ");

/** UC15 / FR26 – public lookup needs both the order code and the receiver phone (TC37, Decree 13/2023 on personal data). */
export async function trackOrder(code: string, phone: string): Promise<TrackingResult | null> {
  const order = await db.order.findUnique({
    where: { code: code.trim().toUpperCase() },
    include: {
      history: { orderBy: { createdAt: "asc" } },
      stops: { orderBy: { id: "desc" }, take: 1, include: { trip: { include: { vehicle: { include: { positions: { orderBy: { recordedAt: "desc" }, take: 1 } } } } } } },
    },
  });
  if (!order || order.receiverPhone !== phone.trim()) return null;
  const stop = order.stops[0];
  const pos = order.status === "DELIVERING" ? stop?.trip.vehicle.positions[0] : undefined;
  const sms = await db.smsMessage.findMany({ where: { orderId: order.id }, orderBy: { createdAt: "asc" } });
  return {
    code: order.code, status: order.status as OrderStatus, receiverName: maskName(order.receiverName), district: order.district,
    expectedDate: order.expectedDate.toISOString(),
    eta: stop && !stop.doneAt ? stop.eta?.toISOString() ?? null : null,
    tripCode: stop?.trip.code ?? null, plate: stop?.trip.vehicle.plate ?? null,
    vehicle: pos ? { lat: pos.lat, lng: pos.lng, recordedAt: pos.recordedAt.toISOString() } : null,
    destination: order.status === "DELIVERING" ? { lat: order.lat, lng: order.lng } : null,
    history: order.history.map((h) => ({ status: h.status as OrderStatus, at: h.createdAt.toISOString(), note: h.status === "RETRY" || h.status === "RETURNED" ? h.note : null })),
    sms: sms.map((m) => ({ content: m.content, at: m.createdAt.toISOString() })),
  };
}
