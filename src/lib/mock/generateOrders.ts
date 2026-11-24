import { DISTRICTS } from "@/constants/districts";
import { GOODS } from "@/constants/mockData";
import { fullName, phoneNumber, streetAddress } from "./generatePeople";
import type { Random } from "./random";
import type { OrderStatus, Zone } from "@/types/order";

export interface MockOrder {
  customerIndex: number;
  warehouseCode: "KHO1" | "KHO2" | "KHO3";
  receiverName: string;
  receiverPhone: string;
  address: string;
  district: string;
  zone: Zone;
  lat: number;
  lng: number;
  weightKg: number;
  volumeM3: number;
  status: OrderStatus;
  items: { name: string; barcode: string; weightKg: number; quantity: number }[];
}

/** Orders for one day; status is chosen by the caller (history vs. today). */
export function generateOrders(r: Random, count: number, customerCount: number, status: (i: number) => OrderStatus): MockOrder[] {
  return Array.from({ length: count }, (_, i) => {
    const d = r.next() < 0.85 ? r.pick(DISTRICTS.filter((x) => x.zone === "URBAN")) : r.pick(DISTRICTS);
    const lines = r.int(1, 3);
    const items = Array.from({ length: lines }, () => {
      const g = r.pick(GOODS);
      return { name: g.name, barcode: `893${r.int(1000000, 9999999)}`, weightKg: g.weightKg, quantity: r.int(1, 4) };
    });
    const weightKg = Math.round(items.reduce((s, it) => s + it.weightKg * it.quantity, 0) * 10) / 10;
    return {
      customerIndex: r.int(0, customerCount - 1),
      warehouseCode: d.warehouse,
      receiverName: fullName(r),
      receiverPhone: phoneNumber(r),
      address: streetAddress(r, d.name),
      district: d.name,
      zone: d.zone,
      lat: r.jitter(d.lat, 0.018),
      lng: r.jitter(d.lng, 0.018),
      weightKg,
      volumeM3: Math.round(weightKg * 0.006 * 1000) / 1000,
      status: status(i),
      items,
    };
  });
}
