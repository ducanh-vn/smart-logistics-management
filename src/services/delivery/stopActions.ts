import "server-only";
import { createHash } from "node:crypto";
import { db } from "@/services/db";
import { writeAudit } from "@/services/audit";
import { sendSms } from "@/services/notify/sms";
import { driverOf } from "./driverTrips";
import { finishTripIfDone } from "./lifecycle";
import type { CommandResult } from "@/services/orders/commands";
import { generateOtp, isOtpExpired } from "@/lib/otp";
import { statusAfterFailure } from "@/lib/orderRules";
import { maskPhone } from "@/lib/format";
import { OTP_MAX_TRIES, OTP_TTL_MINUTES } from "@/constants/business";
import { FAIL_REASONS, SMS_TEMPLATES } from "@/constants/delivery";
import type { OtpSendResult } from "@/types/driver";
import type { SessionUser } from "@/types/auth";
import { authSecret } from "@/services/auth/session";
import { dataUrlBytes, isDemoMode } from "@/lib/demo";

const MAX_PHOTO_BYTES = 2_000_000;
const badPhoto = (photo: string | undefined) => !photo?.startsWith("data:image/") || dataUrlBytes(photo) > MAX_PHOTO_BYTES;

const hashOtp = (stopId: number, otp: string) =>
  createHash("sha256").update(`${stopId}:${otp}:${authSecret()}`).digest("hex");

/** Loads a stop that belongs to the logged-in driver and is still open on a running trip. */
type OwnStop = { error: string; status: number } | { stop: NonNullable<Awaited<ReturnType<typeof loadStop>>> };

const loadStop = (stopId: number) => db.stop.findUnique({ where: { id: stopId }, include: { trip: true, order: true } });

async function ownStop(stopId: number, user: SessionUser): Promise<OwnStop> {
  const driver = await driverOf(user);
  const stop = await loadStop(stopId);
  if (!driver || !stop || stop.trip.driverId !== driver.id) return { error: "Không tìm thấy điểm giao của bạn", status: 404 }
  if (stop.doneAt) return { error: "Điểm giao này đã xử lý xong", status: 409 }
  if (stop.order.status !== "DELIVERING") return { error: "Đơn chưa ở trạng thái Đang giao. Hãy bắt đầu chuyến trước.", status: 409 }
  return { stop }
}

/** BR05 – sends a fresh 6-digit OTP to the receiver; any previous code stops working. */
export async function sendOtp(stopId: number, user: SessionUser): Promise<CommandResult<OtpSendResult>> {
  const r = await ownStop(stopId, user);
  if ("error" in r) return { ok: false, status: r.status, message: r.error };
  const otp = generateOtp();
  const now = new Date();
  await db.stop.update({ where: { id: stopId }, data: { otpHash: hashOtp(stopId, otp), otpSentAt: now, otpTries: 0 } });
  await sendSms(r.stop.order.receiverPhone, SMS_TEMPLATES.otp(r.stop.order.code, otp), r.stop.orderId);
  return { ok: true, data: { sentTo: maskPhone(r.stop.order.receiverPhone), ...(isDemoMode() ? { demoOtp: otp } : {}), expiresAt: new Date(now.getTime() + OTP_TTL_MINUTES * 60_000).toISOString() } };
}

export interface DeliverInput { otp: string; photo: string; lat?: number; lng?: number }

/** UC13 / FR24 – photo + correct, unexpired OTP => "Đã giao" (TC06, TC34, TC35). */
export async function confirmDelivery(stopId: number, input: DeliverInput, user: SessionUser): Promise<CommandResult<{ tripDone: boolean }>> {
  const r = await ownStop(stopId, user);
  if ("error" in r) return { ok: false, status: r.status, message: r.error };
  const { stop } = r;
  if (badPhoto(input.photo)) return { ok: false, status: 400, message: "Cần chụp ảnh giao hàng" };
  if (!stop.otpHash || !stop.otpSentAt) return { ok: false, status: 400, message: "Chưa gửi OTP cho người nhận" };
  if (isOtpExpired(stop.otpSentAt)) return { ok: false, status: 410, message: "OTP đã hết hạn, hãy gửi lại mã mới (BR05)" };
  if (stop.otpTries >= OTP_MAX_TRIES) return { ok: false, status: 429, message: "Nhập sai quá 5 lần, hãy gửi lại mã mới" };
  if (hashOtp(stopId, String(input.otp).trim()) !== stop.otpHash) {
    const tries = stop.otpTries + 1;
    await db.stop.update({ where: { id: stopId }, data: { otpTries: tries } });
    return { ok: false, status: 400, message: `OTP không đúng, còn ${OTP_MAX_TRIES - tries} lần thử` };
  }
  const tripDone = await db.$transaction(async (tx) => {
    await tx.stop.update({ where: { id: stopId }, data: { otpOk: true, photoUrl: input.photo, doneAt: new Date(), doneLat: input.lat ?? null, doneLng: input.lng ?? null } });
    await tx.order.update({ where: { id: stop.orderId }, data: { status: "DELIVERED", history: { create: { status: "DELIVERED", actor: user.username, note: "Xác nhận OTP và ảnh" } } } });
    await sendSms(stop.order.receiverPhone, SMS_TEMPLATES.delivered(stop.order.code), stop.orderId, tx);
    return finishTripIfDone(tx, stop.tripId);
  });
  await writeAudit({ userId: user.id, action: "UPDATE", entity: "Order", entityId: stop.order.code, oldValue: { status: "DELIVERING" }, newValue: { status: "DELIVERED" } });
  return { ok: true, data: { tripDone } };
}

/** UC14 / FR25 – failed delivery: "Giao lại", or "Hoàn kho" after the second redelivery (BR06, TC36). */
export async function reportFailure(stopId: number, reason: string, photo: string, user: SessionUser): Promise<CommandResult<{ status: string; tripDone: boolean }>> {
  const r = await ownStop(stopId, user);
  if ("error" in r) return { ok: false, status: r.status, message: r.error };
  if (!(FAIL_REASONS as readonly string[]).includes(reason)) return { ok: false, status: 400, message: "Chọn lý do giao không thành công" };
  if (badPhoto(photo)) return { ok: false, status: 400, message: "Cần chụp ảnh hiện trường" };
  const { stop } = r;
  const next = statusAfterFailure(stop.order.failedAttempts);
  const tripDone = await db.$transaction(async (tx) => {
    await tx.stop.update({ where: { id: stopId }, data: { failReason: reason, photoUrl: photo, doneAt: new Date() } });
    await tx.order.update({
      where: { id: stop.orderId },
      data: { status: next.status, failedAttempts: next.failedAttempts, history: { create: { status: next.status, actor: user.username, note: `Lần ${next.failedAttempts}: ${reason}` } } },
    });
    const sms = next.status === "RETURNED" ? SMS_TEMPLATES.returned(stop.order.code) : SMS_TEMPLATES.failed(stop.order.code, reason);
    await sendSms(stop.order.receiverPhone, sms, stop.orderId, tx);
    return finishTripIfDone(tx, stop.tripId);
  });
  await writeAudit({ userId: user.id, action: "UPDATE", entity: "Order", entityId: stop.order.code, oldValue: { status: "DELIVERING" }, newValue: next });
  return { ok: true, data: { status: next.status, tripDone } };
}
