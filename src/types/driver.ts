import type { OrderStatus } from "./order";
import type { TripStatus } from "./fleet";

export interface DriverStop {
  id: number;
  seq: number;
  eta: string | null;
  orderId: number;
  orderCode: string;
  orderStatus: OrderStatus;
  receiverName: string;
  receiverPhone: string;
  address: string;
  district: string;
  lat: number;
  lng: number;
  weightKg: number;
  fee: number;
  items: string;
  otpSent: boolean;
  doneAt: string | null;
  failReason: string | null;
}

export interface DriverTrip {
  id: number;
  code: string;
  status: TripStatus;
  plate: string;
  warehouseName: string;
  totalKm: number;
  stops: DriverStop[];
}

export interface OtpSendResult {
  sentTo: string; // masked phone
  demoOtp?: string; // only in demo mode, because SMS is mocked
  expiresAt: string;
}

export interface TrackingResult {
  code: string;
  status: OrderStatus;
  receiverName: string;
  district: string;
  expectedDate: string;
  eta: string | null;
  tripCode: string | null;
  plate: string | null;
  vehicle: { lat: number; lng: number; recordedAt: string } | null;
  destination: { lat: number; lng: number } | null;
  history: { status: OrderStatus; at: string; note: string | null }[];
  sms: { content: string; at: string }[];
}
