export type VehicleStatus = "READY" | "ON_TRIP" | "MAINTENANCE";
export type TripStatus = "NEW" | "DISPATCHED" | "RUNNING" | "DONE";
export type Shift = "MORNING" | "AFTERNOON";

export interface VehicleInfo {
  id: number;
  plate: string;
  type: string;
  capacityKg: number;
  capacityM3: number;
  status: VehicleStatus;
  nextServiceAt: string;
}

export type MaintenanceState = "OVERDUE" | "DUE_SOON" | "OK";

export interface VehicleRow extends VehicleInfo {
  maintenance: MaintenanceState;
  daysToService: number;
  dispatchable: boolean;
  currentTrip: string | null;
}

export interface VehicleInput {
  plate: string;
  type: string;
  capacityKg: number;
  capacityM3: number;
  nextServiceAt: string; // yyyy-MM-dd
}

export interface DriverRow {
  id: number;
  code: string;
  fullName: string;
  phone: string;
  licenseNo: string;
  shift: Shift;
  username: string | null;
  busy: boolean;
}
