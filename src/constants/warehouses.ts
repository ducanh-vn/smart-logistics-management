import type { WarehouseInfo } from "@/types/warehouse";

/** The 3 warehouses of Công ty Logistics ABC (hypothetical, Hà Nội). */
export const WAREHOUSES: WarehouseInfo[] = [
  { code: "KHO1", name: "Kho 1 – Hoàng Mai", address: "Đường Lĩnh Nam, Q. Hoàng Mai, Hà Nội", lat: 20.9685, lng: 105.8585 },
  { code: "KHO2", name: "Kho 2 – Bắc Từ Liêm", address: "Đường Phạm Văn Đồng, Q. Bắc Từ Liêm, Hà Nội", lat: 21.0652, lng: 105.7655 },
  { code: "KHO3", name: "Kho 3 – Long Biên", address: "Đường Nguyễn Văn Linh, Q. Long Biên, Hà Nội", lat: 21.0448, lng: 105.9052 },
];

/** Each warehouse: zones A–D, racks 01–05, slots 01–04 -> 80 locations. */
export const LOCATION_LAYOUT = { zones: ["A", "B", "C", "D"], racks: 5, slots: 4 };
