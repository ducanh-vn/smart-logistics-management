import type { GeoPoint } from "@/types/routing";
import { roadKm } from "@/lib/geo";

/** Symmetric distance matrix; index 0 is the depot (warehouse). */
export function buildDistanceMatrix(depot: GeoPoint, points: GeoPoint[]): number[][] {
  const all = [depot, ...points];
  const n = all.length;
  const m: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      const d = roadKm(all[i], all[j]);
      m[i][j] = d;
      m[j][i] = d;
    }
  return m;
}

/** Length of depot -> route -> depot (route holds matrix indexes, 1-based). */
export function routeLength(route: number[], m: number[][]): number {
  if (!route.length) return 0;
  let d = m[0][route[0]];
  for (let i = 1; i < route.length; i++) d += m[route[i - 1]][route[i]];
  return d + m[route[route.length - 1]][0];
}
