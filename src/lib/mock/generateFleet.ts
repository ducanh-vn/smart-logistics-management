import { VEHICLE_TYPES } from "@/constants/mockData";
import type { Random } from "./random";

export interface MockVehicle {
  plate: string;
  type: string;
  capacityKg: number;
  capacityM3: number;
  status: "READY" | "MAINTENANCE";
  nextServiceAt: Date;
  warehouseIndex: number; // 0..2, home warehouse
}

/** 50 trucks split by type share; two are in maintenance (FR14 demo). */
export function generateVehicles(r: Random, count: number, today: Date): MockVehicle[] {
  const list: MockVehicle[] = [];
  VEHICLE_TYPES.forEach((vt) => {
    const n = Math.round(count * vt.share);
    for (let i = 0; i < n && list.length < count; i++) {
      const days = r.int(3, 120);
      list.push({
        plate: `29C-${r.int(100, 999)}.${String(r.int(0, 99)).padStart(2, "0")}`,
        type: vt.type,
        capacityKg: vt.capacityKg,
        capacityM3: vt.capacityM3,
        status: "READY",
        nextServiceAt: new Date(today.getTime() + days * 86_400_000),
        warehouseIndex: list.length % 3,
      });
    }
  });
  // FR14: vehicles due for service are not dispatchable.
  list[4].status = "MAINTENANCE";
  list[4].nextServiceAt = today;
  list[17].nextServiceAt = new Date(today.getTime() + 5 * 86_400_000);
  return list;
}
