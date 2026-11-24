import type { MaintenanceState, VehicleInput, VehicleStatus } from "@/types/fleet";
import { PLATE_REGEX } from "@/constants/fleet";
import { SERVICE_REMIND_DAYS } from "@/constants/business";

const DAY = 86_400_000;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** Whole days from today until the service date (negative = overdue). */
export const daysUntil = (date: Date, now: Date): number => Math.round((startOfDay(date) - startOfDay(now)) / DAY);

/** FR14 – overdue on/after the due date, reminder from 7 days before. */
export function maintenanceState(nextServiceAt: Date, now: Date): MaintenanceState {
  const d = daysUntil(nextServiceAt, now);
  if (d <= 0) return "OVERDUE";
  if (d <= SERVICE_REMIND_DAYS) return "DUE_SOON";
  return "OK";
}

/** FR14 – only ready vehicles that are not due for service can be given a trip. */
export const isDispatchable = (status: VehicleStatus, nextServiceAt: Date, now: Date): boolean =>
  status === "READY" && maintenanceState(nextServiceAt, now) !== "OVERDUE";

export function validateVehicle(v: Partial<VehicleInput>): string[] {
  const errors: string[] = [];
  if (!v.plate || !PLATE_REGEX.test(v.plate)) errors.push("Biển số không đúng dạng, ví dụ 29C-123.45");
  if (!v.type) errors.push("Chọn loại xe");
  if (!(Number(v.capacityKg) > 0)) errors.push("Tải trọng phải lớn hơn 0");
  if (!(Number(v.capacityM3) > 0)) errors.push("Thể tích phải lớn hơn 0");
  if (!v.nextServiceAt || Number.isNaN(Date.parse(v.nextServiceAt))) errors.push("Chọn ngày bảo dưỡng kế tiếp");
  return errors;
}
