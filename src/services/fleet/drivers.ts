import "server-only";
import { db } from "@/services/db";
import { writeAudit } from "@/services/audit";
import type { CommandResult } from "@/services/orders/commands";
import type { DriverRow, Shift } from "@/types/fleet";
import type { SessionUser } from "@/types/auth";

/** FR15 – drivers with shift and whether they already have an active trip. */
export async function listDrivers(): Promise<DriverRow[]> {
  const drivers = await db.driver.findMany({
    include: { user: { select: { username: true } }, trips: { where: { status: { in: ["NEW", "DISPATCHED", "RUNNING"] } }, select: { id: true }, take: 1 } },
    orderBy: { code: "asc" },
  });
  return drivers.map((d) => ({
    id: d.id, code: d.code, fullName: d.fullName, phone: d.phone, licenseNo: d.licenseNo,
    shift: d.shift as Shift, username: d.user?.username ?? null, busy: d.trips.length > 0,
  }));
}

export async function updateDriver(id: number, patch: { shift?: Shift; phone?: string; licenseNo?: string }, user: SessionUser): Promise<CommandResult<{ id: number }>> {
  if (patch.shift && !["MORNING", "AFTERNOON"].includes(patch.shift)) return { ok: false, status: 400, message: "Ca làm việc không hợp lệ" };
  if (patch.phone && !/^0\d{9}$/.test(patch.phone)) return { ok: false, status: 400, message: "Số điện thoại không hợp lệ" };
  const before = await db.driver.findUnique({ where: { id } });
  if (!before) return { ok: false, status: 404, message: "Không tìm thấy tài xế" };
  const data = { shift: patch.shift, phone: patch.phone, licenseNo: patch.licenseNo };
  await db.driver.update({ where: { id }, data });
  await writeAudit({ userId: user.id, action: "UPDATE", entity: "Driver", entityId: before.code, oldValue: { shift: before.shift, phone: before.phone }, newValue: data });
  return { ok: true, data: { id } };
}
