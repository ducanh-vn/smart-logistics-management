/** Deterministic pseudo-random generator (mulberry32) so seed data is reproducible. */
export function createRandom(seed: number) {
  let a = seed >>> 0;
  const next = (): number => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min;
  const pick = <T,>(list: readonly T[]): T => list[Math.floor(next() * list.length)];
  const jitter = (value: number, spread: number) => value + (next() - 0.5) * 2 * spread;
  return { next, int, pick, jitter };
}

export type Random = ReturnType<typeof createRandom>;
