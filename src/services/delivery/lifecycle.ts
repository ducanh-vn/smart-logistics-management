import "server-only";
import type { Prisma } from "@prisma/client";
import { sendSms } from "@/services/notify/sms";
import { SMS_TEMPLATES } from "@/constants/delivery";

type Tx = Prisma.TransactionClient;

const hhmm = (d: Date | null) => (d ? `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}` : "trong ngay");

/**
 * The trip leaves the warehouse: assigned orders become "Đang giao" and receivers get an SMS (FR27).
 * Called by the goods issue for a trip (TC20) and by the driver pressing "Bắt đầu chuyến". Safe to call twice.
 */
export async function startTrip(tx: Tx, tripId: number, actor: string, note: string) {
  const stops = await tx.stop.findMany({ where: { tripId }, include: { order: true } });
  for (const s of stops.filter((x) => x.order.status === "ASSIGNED")) {
    await tx.order.update({
      where: { id: s.order.id },
      data: { status: "DELIVERING", history: { create: { status: "DELIVERING", actor, note } } },
    });
    await sendSms(s.order.receiverPhone, SMS_TEMPLATES.delivering(s.order.code, hhmm(s.eta)), s.order.id, tx);
  }
  await tx.trip.updateMany({ where: { id: tripId, status: { in: ["NEW", "DISPATCHED"] } }, data: { status: "RUNNING" } });
}

/** Closes the trip and frees the vehicle once every stop is delivered or failed. */
export async function finishTripIfDone(tx: Tx, tripId: number) {
  const open = await tx.stop.count({ where: { tripId, doneAt: null } });
  if (open) return false;
  const trip = await tx.trip.update({ where: { id: tripId }, data: { status: "DONE" } });
  await tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: "READY" } });
  return true;
}
