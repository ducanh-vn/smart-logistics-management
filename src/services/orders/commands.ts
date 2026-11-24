import "server-only";
import { db } from "@/services/db";
import { writeAudit } from "@/services/audit";
import { calculateFee } from "@/lib/pricing";
import { orderCode } from "@/lib/format";
import { validateOrderInput } from "@/lib/validation";
import { canEdit, canTransition } from "@/lib/orderRules";
import { findDistrict } from "@/constants/districts";
import type { OrderInput, OrderStatus, PriceRule, ValidationError } from "@/types/order";
import type { SessionUser } from "@/types/auth";

export type CommandResult<T> = { ok: true; data: T } | { ok: false; status: number; message: string; errors?: ValidationError[] };

export const getPriceRules = async () => (await db.priceRule.findMany()) as PriceRule[];

/** Fee preview for the create form (FR03). */
export async function quoteFee(district: string, weightKg: number) {
  const d = findDistrict(district);
  if (!d || !(weightKg > 0)) return null;
  return { zone: d.zone, fee: calculateFee(weightKg, d.zone, await getPriceRules()) };
}

async function nextCode(today: Date): Promise<string> {
  const prefix = orderCode(today, 0).slice(0, 8);
  const last = await db.order.findFirst({ where: { code: { startsWith: prefix } }, orderBy: { code: "desc" }, select: { code: true } });
  return orderCode(today, (last ? Number(last.code.slice(8)) : 0) + 1);
}

/** UC03 – create an order in status "Chờ duyệt". */
export async function createOrder(input: OrderInput, user: SessionUser): Promise<CommandResult<{ id: number; code: string; fee: number }>> {
  const errors = validateOrderInput(input);
  if (errors.length) return { ok: false, status: 400, message: "Dữ liệu không hợp lệ", errors };
  const d = findDistrict(input.district)!;
  const fee = calculateFee(input.weightKg, d.zone, await getPriceRules());
  const warehouse = input.warehouseId || (await db.warehouse.findUnique({ where: { code: d.warehouse } }))!.id;
  const offset = () => (Math.random() - 0.5) * 0.02; // demo geocoding: district centre + small offset
  const order = await db.order.create({
    data: {
      code: await nextCode(new Date()), customerId: input.customerId, warehouseId: warehouse,
      receiverName: input.receiverName.trim(), receiverPhone: input.receiverPhone.trim(), address: input.address.trim(),
      district: d.name, zone: d.zone, lat: d.lat + offset(), lng: d.lng + offset(), weightKg: input.weightKg,
      volumeM3: input.volumeM3 || Math.round(input.weightKg * 6) / 1000, fee, status: "PENDING",
      expectedDate: input.expectedDate ? new Date(input.expectedDate) : new Date(Date.now() + 86_400_000),
      items: { create: input.items ?? [] },
      history: { create: { status: "PENDING", actor: user.username } },
    },
  });
  await writeAudit({ userId: user.id, action: "CREATE", entity: "Order", entityId: order.code, newValue: { fee } });
  return { ok: true, data: { id: order.id, code: order.code, fee } };
}

/** Status change with BR02 / BR07 checks (approve, cancel). */
export async function changeStatus(ids: number[], to: OrderStatus, user: SessionUser, note?: string) {
  const orders = await db.order.findMany({ where: { id: { in: ids } } });
  const done: string[] = [];
  const rejected: { code: string; reason: string }[] = [];
  for (const o of orders) {
    const from = o.status as OrderStatus;
    if (to === "CANCELLED" && !canEdit(from)) {
      rejected.push({ code: o.code, reason: "Đơn đã phân xe, không được hủy (BR07)" });
      continue;
    }
    if (!canTransition(from, to)) {
      rejected.push({ code: o.code, reason: "Không thể chuyển trạng thái" });
      continue;
    }
    await db.order.update({ where: { id: o.id }, data: { status: to, history: { create: { status: to, actor: user.username, note } } } });
    await writeAudit({ userId: user.id, action: "UPDATE", entity: "Order", entityId: o.code, oldValue: { status: from }, newValue: { status: to } });
    done.push(o.code);
  }
  return { done, rejected };
}

/** FR04 – edit receiver info / weight while the order is still editable (BR07). */
export async function updateOrder(id: number, patch: Partial<OrderInput>, user: SessionUser): Promise<CommandResult<{ fee: number }>> {
  const o = await db.order.findUnique({ where: { id } });
  if (!o) return { ok: false, status: 404, message: "Không tìm thấy đơn hàng" };
  if (!canEdit(o.status as OrderStatus)) return { ok: false, status: 409, message: "Đơn đã phân xe, không được sửa (BR07)" };
  const merged = { ...o, ...patch, customerId: o.customerId, items: [] } as unknown as OrderInput;
  const errors = validateOrderInput(merged);
  if (errors.length) return { ok: false, status: 400, message: "Dữ liệu không hợp lệ", errors };
  const d = findDistrict(merged.district)!;
  const fee = calculateFee(merged.weightKg, d.zone, await getPriceRules());
  await db.order.update({
    where: { id },
    data: { receiverName: merged.receiverName, receiverPhone: merged.receiverPhone, address: merged.address, district: d.name, zone: d.zone, weightKg: merged.weightKg, fee },
  });
  await writeAudit({ userId: user.id, action: "UPDATE", entity: "Order", entityId: o.code, oldValue: { fee: o.fee, weightKg: o.weightKg }, newValue: { fee, weightKg: merged.weightKg } });
  return { ok: true, data: { fee } };
}
