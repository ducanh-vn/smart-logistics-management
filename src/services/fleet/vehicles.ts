import "server-only";
import { db } from "@/services/db";
import { writeAudit } from "@/services/audit";
import type { CommandResult } from "@/services/orders/commands";
import { daysUntil, isDispatchable, maintenanceState, validateVehicle } from "@/lib/fleet";
import { SERVICE_INTERVAL_DAYS } from "@/constants/business";
import type { VehicleInput, VehicleRow, VehicleStatus } from "@/types/fleet";
import type { SessionUser } from "@/types/auth";

const ACTIVE_TRIP = ["NEW", "DISPATCHED", "RUNNING"];

/** FR13/FR14 – vehicles with maintenance state and current trip. */
export async function listVehicles(): Promise<VehicleRow[]> {
  const now = new Date();
  const vehicles = await db.vehicle.findMany({
    include: { trips: { where: { status: { in: ACTIVE_TRIP } }, select: { code: true }, take: 1 } },
    orderBy: { plate: "asc" },
  });
  return vehicles.map((v) => ({
    id: v.id, plate: v.plate, type: v.type, capacityKg: v.capacityKg, capacityM3: v.capacityM3,
    status: v.status as VehicleStatus, nextServiceAt: v.nextServiceAt.toISOString(),
    maintenance: maintenanceState(v.nextServiceAt, now),
    daysToService: daysUntil(v.nextServiceAt, now),
    dispatchable: isDispatchable(v.status as VehicleStatus, v.nextServiceAt, now) && v.trips.length === 0,
    currentTrip: v.trips[0]?.code ?? null,
  }));
}

export async function saveVehicle(input: VehicleInput, user: SessionUser, id?: number): Promise<CommandResult<{ id: number }>> {
  const errors = validateVehicle(input);
  if (errors.length) return { ok: false, status: 400, message: errors.join(". ") };
  const data = {
    plate: input.plate, type: input.type, capacityKg: Number(input.capacityKg), capacityM3: Number(input.capacityM3),
    nextServiceAt: new Date(`${input.nextServiceAt}T00:00:00`),
  };
  const dup = await db.vehicle.findFirst({ where: { plate: data.plate, ...(id ? { NOT: { id } } : {}) } });
  if (dup) return { ok: false, status: 409, message: `Biển số ${data.plate} đã tồn tại` };
  const before = id ? await db.vehicle.findUnique({ where: { id } }) : null;
  const v = id ? await db.vehicle.update({ where: { id }, data }) : await db.vehicle.create({ data });
  await writeAudit({ userId: user.id, action: id ? "UPDATE" : "CREATE", entity: "Vehicle", entityId: v.plate, oldValue: before ?? undefined, newValue: data });
  return { ok: true, data: { id: v.id } };
}

/** FR14 – put a vehicle into maintenance, or finish maintenance (next service in 90 days). */
export async function setMaintenance(id: number, action: "START" | "FINISH", user: SessionUser): Promise<CommandResult<{ status: string }>> {
  const v = await db.vehicle.findUnique({ where: { id }, include: { trips: { where: { status: { in: ACTIVE_TRIP } }, take: 1 } } });
  if (!v) return { ok: false, status: 404, message: "Không tìm thấy xe" };
  if (action === "START" && v.trips.length) return { ok: false, status: 409, message: "Xe đang có chuyến, chưa thể đưa vào bảo dưỡng" };
  const data =
    action === "START"
      ? { status: "MAINTENANCE" }
      : { status: "READY", nextServiceAt: new Date(Date.now() + SERVICE_INTERVAL_DAYS * 86_400_000) };
  await db.vehicle.update({ where: { id }, data });
  await writeAudit({ userId: user.id, action: "UPDATE", entity: "Vehicle", entityId: v.plate, oldValue: { status: v.status }, newValue: data });
  return { ok: true, data: { status: data.status } };
}
