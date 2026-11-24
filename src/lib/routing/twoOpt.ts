import { routeLength } from "./distanceMatrix";

/**
 * 2-opt improvement: reverse segments while it shortens the route,
 * stopping at a local optimum or when the deadline passes.
 */
export function twoOpt(route: number[], m: number[][], deadline: number): number[] {
  if (route.length < 3) return route;
  let best = [0, ...route, 0];
  let improved = true;
  while (improved && Date.now() < deadline) {
    improved = false;
    for (let i = 1; i < best.length - 2; i++) {
      for (let k = i + 1; k < best.length - 1; k++) {
        const delta = m[best[i - 1]][best[k]] + m[best[i]][best[k + 1]] - m[best[i - 1]][best[i]] - m[best[k]][best[k + 1]];
        if (delta < -1e-9) {
          best = [...best.slice(0, i), ...best.slice(i, k + 1).reverse(), ...best.slice(k + 1)];
          improved = true;
        }
      }
    }
  }
  const result = best.slice(1, -1);
  return routeLength(result, m) <= routeLength(route, m) ? result : route;
}
