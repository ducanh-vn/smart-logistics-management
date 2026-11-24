import type { TripStatus } from "@/types/fleet";

/** Distinct colours for routes on the map (cycled). */
export const ROUTE_COLORS = ["#1f77b4", "#d62728", "#2ca02c", "#9467bd", "#ff7f0e", "#17becf", "#8c564b", "#e377c2", "#bcbd22", "#393b79"];
export const routeColor = (i: number) => ROUTE_COLORS[i % ROUTE_COLORS.length];

export const TRIP_STATUS_LABELS: Record<TripStatus, string> = {
  NEW: "Mới",
  DISPATCHED: "Đã gửi lệnh",
  RUNNING: "Đang chạy",
  DONE: "Hoàn thành",
};

export const TRIP_STATUS_COLORS: Record<TripStatus, string> = {
  NEW: "bg-slate-100 text-slate-700",
  DISPATCHED: "bg-amber-100 text-amber-800",
  RUNNING: "bg-sky-100 text-sky-700",
  DONE: "bg-emerald-100 text-emerald-700",
};

export type DispatchTab = "plan" | "tracking";
export const DISPATCH_TABS: { key: DispatchTab; label: string }[] = [
  { key: "plan", label: "Lập kế hoạch giao hàng" },
  { key: "tracking", label: "Theo dõi chuyến xe" },
];

export const HANOI_CENTER: [number, number] = [21.02, 105.84];
export const OSM_TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
export const OSM_ATTRIBUTION = "&copy; OpenStreetMap";
export const TRACKING_POLL_MS = 10_000; // well inside the 30 s requirement of TC05
export const SIMULATE_EVERY_MS = 5_000;
