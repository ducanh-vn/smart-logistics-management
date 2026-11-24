import type { MaintenanceState, Shift, VehicleStatus } from "@/types/fleet";
import { VEHICLE_TYPES } from "./mockData";

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  READY: "Sẵn sàng",
  ON_TRIP: "Đang chạy",
  MAINTENANCE: "Bảo dưỡng",
};

export const VEHICLE_STATUS_COLORS: Record<VehicleStatus, string> = {
  READY: "bg-emerald-100 text-emerald-700",
  ON_TRIP: "bg-sky-100 text-sky-700",
  MAINTENANCE: "bg-slate-200 text-slate-700",
};

export const MAINTENANCE_LABELS: Record<MaintenanceState, string> = {
  OVERDUE: "Đến hạn",
  DUE_SOON: "Sắp đến hạn",
  OK: "Bình thường",
};

export const SHIFT_LABELS: Record<Shift, string> = { MORNING: "Ca sáng (6h–14h)", AFTERNOON: "Ca chiều (12h–20h)" };

export const VEHICLE_TYPE_OPTIONS = VEHICLE_TYPES.map((v) => ({ value: v.type, label: v.type, capacityKg: v.capacityKg, capacityM3: v.capacityM3 }));

export type FleetTab = "vehicles" | "maintenance" | "drivers";
export const FLEET_TABS: { key: FleetTab; label: string }[] = [
  { key: "vehicles", label: "Xe" },
  { key: "maintenance", label: "Bảo dưỡng" },
  { key: "drivers", label: "Tài xế, ca làm việc" },
];

/** Vietnamese truck plate, e.g. 29C-123.45 */
export const PLATE_REGEX = /^\d{2}[A-Z]{1,2}-\d{3}\.\d{2}$/;
