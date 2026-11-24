import type { OrderStatus } from "./order";

export interface DashboardData {
  date: string;
  ordersByStatus: { status: OrderStatus; count: number }[];
  totalOrders: number;
  delivered: number;
  onTimeRate: number | null; // 0..1
  activeVehicles: number;
  totalVehicles: number;
  trips: number;
  totalKm: number;
  trend: { day: string; created: number; delivered: number; onTimeRate: number | null }[];
}

export interface VehiclePerformance {
  vehicleId: number;
  plate: string;
  type: string;
  capacityKg: number;
  trips: number;
  stops: number;
  totalKm: number;
  totalKg: number;
  loadFactor: number; // average kg used / capacity, 0..1
  cost: number; // VND
  costPerStop: number;
}

export interface PerformanceReport {
  from: string;
  to: string;
  rows: VehiclePerformance[];
  totals: { trips: number; stops: number; totalKm: number; totalKg: number; cost: number; loadFactor: number };
}
