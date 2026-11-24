import type { GeoPoint } from "./routing";
import type { TripStatus } from "./fleet";

export interface PlanStop extends GeoPoint {
  orderId: number;
  code: string;
  receiverName: string;
  address: string;
  district: string;
  weightKg: number;
  volumeM3: number;
}

export interface PlanRoute {
  vehicleId: number;
  plate: string;
  capacityKg: number;
  capacityM3: number;
  driverId: number | null;
  stops: PlanStop[];
}

/** Result of the optimizer, editable on screen before confirmation (FR16–FR18). */
export interface DispatchPlan {
  warehouseId: number;
  depot: GeoPoint;
  routes: PlanRoute[];
  unassigned: PlanStop[];
  elapsedMs: number;
}

export interface RouteStats {
  totalKg: number;
  totalM3: number;
  distanceKm: number;
  durationMin: number;
  overloaded: boolean;
}

export interface TripSummary {
  id: number;
  code: string;
  status: TripStatus;
  plate: string;
  vehicleId: number;
  driverName: string;
  stopCount: number;
  doneCount: number;
  totalKg: number;
  totalKm: number;
  path: (GeoPoint & { seq: number; code: string; done: boolean })[];
  position: (GeoPoint & { recordedAt: string; speedKmh: number }) | null;
}

export interface TripPayload {
  vehicleId: number;
  driverId: number;
  orderIds: number[];
}
