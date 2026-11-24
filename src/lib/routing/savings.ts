import type { RouteStop } from "@/types/routing";

export interface Capacity {
  kg: number;
  m3: number;
  /** Optional limit on stops per route (driver shift length). */
  stops?: number;
}

/** Bonus (km) added to the saving of two stops in the same district: the "cluster by area" step. */
const SAME_AREA_BONUS = 0.5;

/**
 * Clarke–Wright savings (parallel version) with capacity limits (BR04).
 * Returns routes as lists of matrix indexes (1-based, 0 = depot).
 */
export function clarkeWright(stops: RouteStop[], m: number[][], cap: Capacity): number[][] {
  const n = stops.length;
  const routeOf = new Array<number>(n + 1);
  const routes: (number[] | null)[] = [null];
  const load: Capacity[] = [{ kg: 0, m3: 0 }];
  for (let i = 1; i <= n; i++) {
    routes.push([i]);
    routeOf[i] = i;
    load.push({ kg: stops[i - 1].weightKg, m3: stops[i - 1].volumeM3 });
  }

  const savings: { i: number; j: number; s: number }[] = [];
  for (let i = 1; i <= n; i++)
    for (let j = i + 1; j <= n; j++) {
      const bonus = stops[i - 1].district === stops[j - 1].district ? SAME_AREA_BONUS : 0;
      savings.push({ i, j, s: m[0][i] + m[0][j] - m[i][j] + bonus });
    }
  savings.sort((a, b) => b.s - a.s);

  for (const { i, j, s } of savings) {
    if (s <= 0) break;
    const ri = routeOf[i];
    const rj = routeOf[j];
    if (ri === rj) continue;
    const a = routes[ri]!;
    const b = routes[rj]!;
    if (load[ri].kg + load[rj].kg > cap.kg || load[ri].m3 + load[rj].m3 > cap.m3) continue;
    if (cap.stops && a.length + b.length > cap.stops) continue;
    // i and j must be route ends so the two routes can be joined at i–j.
    let merged: number[] | null = null;
    if (a[a.length - 1] === i && b[0] === j) merged = [...a, ...b];
    else if (a[0] === i && b[b.length - 1] === j) merged = [...b, ...a];
    else if (a[0] === i && b[0] === j) merged = [...a.reverse(), ...b];
    else if (a[a.length - 1] === i && b[b.length - 1] === j) merged = [...a, ...b.reverse()];
    if (!merged) continue;
    routes[ri] = merged;
    routes[rj] = null;
    load[ri] = { kg: load[ri].kg + load[rj].kg, m3: load[ri].m3 + load[rj].m3 };
    for (const k of merged) routeOf[k] = ri;
  }
  return routes.filter((r): r is number[] => r !== null);
}
