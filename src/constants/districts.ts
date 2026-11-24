import type { Zone } from "@/types/order";

export interface District {
  name: string;
  zone: Zone;
  lat: number;
  lng: number;
  /** Warehouse that normally serves this area. */
  warehouse: "KHO1" | "KHO2" | "KHO3";
}

/** Approximate centres of delivery areas used for demo data and zone pricing. */
export const DISTRICTS: District[] = [
  { name: "Ba Đình", zone: "URBAN", lat: 21.0340, lng: 105.8140, warehouse: "KHO2" },
  { name: "Hoàn Kiếm", zone: "URBAN", lat: 21.0285, lng: 105.8520, warehouse: "KHO1" },
  { name: "Đống Đa", zone: "URBAN", lat: 21.0180, lng: 105.8300, warehouse: "KHO1" },
  { name: "Hai Bà Trưng", zone: "URBAN", lat: 21.0060, lng: 105.8570, warehouse: "KHO1" },
  { name: "Cầu Giấy", zone: "URBAN", lat: 21.0330, lng: 105.7900, warehouse: "KHO2" },
  { name: "Thanh Xuân", zone: "URBAN", lat: 20.9940, lng: 105.8050, warehouse: "KHO1" },
  { name: "Hoàng Mai", zone: "URBAN", lat: 20.9740, lng: 105.8630, warehouse: "KHO1" },
  { name: "Long Biên", zone: "URBAN", lat: 21.0470, lng: 105.8890, warehouse: "KHO3" },
  { name: "Tây Hồ", zone: "URBAN", lat: 21.0700, lng: 105.8180, warehouse: "KHO2" },
  { name: "Nam Từ Liêm", zone: "URBAN", lat: 21.0120, lng: 105.7650, warehouse: "KHO2" },
  { name: "Bắc Từ Liêm", zone: "URBAN", lat: 21.0700, lng: 105.7600, warehouse: "KHO2" },
  { name: "Hà Đông", zone: "URBAN", lat: 20.9710, lng: 105.7760, warehouse: "KHO1" },
  { name: "Đông Anh", zone: "SUBURBAN", lat: 21.1370, lng: 105.8500, warehouse: "KHO3" },
  { name: "Gia Lâm", zone: "SUBURBAN", lat: 21.0200, lng: 105.9400, warehouse: "KHO3" },
  { name: "Thanh Trì", zone: "SUBURBAN", lat: 20.9400, lng: 105.8450, warehouse: "KHO1" },
  { name: "Hoài Đức", zone: "SUBURBAN", lat: 21.0300, lng: 105.7000, warehouse: "KHO2" },
  { name: "Bắc Ninh", zone: "INTERPROVINCE", lat: 21.1860, lng: 106.0760, warehouse: "KHO3" },
  { name: "Văn Lâm (Hưng Yên)", zone: "INTERPROVINCE", lat: 20.9800, lng: 106.0300, warehouse: "KHO3" },
];

export const findDistrict = (name: string): District | undefined =>
  DISTRICTS.find((d) => d.name.toLowerCase() === name.trim().toLowerCase());
