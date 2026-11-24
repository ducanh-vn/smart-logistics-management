export interface GeoPoint {
  lat: number;
  lng: number;
}

/** A delivery point to be routed (one order). */
export interface RouteStop extends GeoPoint {
  orderId: number;
  weightKg: number;
  volumeM3: number;
  district: string;
}

/** A vehicle available for routing. */
export interface RouteVehicle {
  vehicleId: number;
  capacityKg: number;
  capacityM3: number;
}

export interface PlannedRoute {
  vehicleId: number;
  orderIds: number[]; // in delivery order
  totalKg: number;
  totalM3: number;
  distanceKm: number;
}

export interface RoutingResult {
  routes: PlannedRoute[];
  unassigned: number[]; // orderIds that did not fit (BR04)
  totalKm: number;
  elapsedMs: number;
}

export interface RoutingOptions {
  timeLimitMs: number;
  maxStopsPerRoute?: number;
}
