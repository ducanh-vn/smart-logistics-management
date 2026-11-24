export type OrderStatus =
  | "PENDING"
  | "APPROVED"
  | "ASSIGNED"
  | "DELIVERING"
  | "DELIVERED"
  | "RETRY"
  | "RETURNED"
  | "CANCELLED";

export type Zone = "URBAN" | "SUBURBAN" | "INTERPROVINCE";

export interface PriceRule {
  zone: Zone;
  baseFee: number;
  includedKg: number;
  perKgFee: number;
}

export interface OrderInput {
  customerId: number;
  warehouseId: number;
  receiverName: string;
  receiverPhone: string;
  address: string;
  district: string;
  weightKg: number;
  volumeM3: number;
  expectedDate: string;
  items: { name: string; barcode: string; weightKg: number; quantity: number }[];
}

export interface OrderSummary {
  id: number;
  code: string;
  customerName: string;
  receiverName: string;
  receiverPhone: string;
  address: string;
  district: string;
  zone: Zone;
  weightKg: number;
  fee: number;
  status: OrderStatus;
  warehouseCode: string;
  createdAt: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

/** Order detail as returned by GET /api/orders/[id]. */
export interface OrderDetail {
  id: number;
  code: string;
  receiverName: string;
  receiverPhone: string;
  address: string;
  district: string;
  zone: Zone;
  weightKg: number;
  volumeM3: number;
  fee: number;
  status: OrderStatus;
  failedAttempts: number;
  expectedDate: string;
  createdAt: string;
  customer: { code: string; name: string; phone: string };
  warehouse: { code: string; name: string };
  items: { id: number; name: string; barcode: string; weightKg: number; quantity: number }[];
  history: { id: number; status: OrderStatus; note: string | null; actor: string; createdAt: string }[];
  stops: { id: number; trip: { code: string; vehicle: { plate: string } } }[];
}
