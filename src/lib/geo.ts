import type { GeoPoint } from "@/types/routing";
import { ROAD_FACTOR } from "@/constants/business";

const EARTH_KM = 6371;
const rad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in km. */
export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.sqrt(h));
}

/** Estimated road distance. The demo uses no paid map API (see README). */
export const roadKm = (a: GeoPoint, b: GeoPoint): number => haversineKm(a, b) * ROAD_FACTOR;

/** Point `km` (straight-line) from `from` towards `to`; returns `to` when closer than that. */
export function moveToward(from: GeoPoint, to: GeoPoint, km: number): GeoPoint {
  const d = haversineKm(from, to);
  if (d <= km || d === 0) return { lat: to.lat, lng: to.lng };
  const f = km / d;
  return { lat: from.lat + (to.lat - from.lat) * f, lng: from.lng + (to.lng - from.lng) * f };
}
