/**
 * Deterministic run randomness. Logic never calls Math.random(), so any run can
 * be replayed from its seed.
 */

/** mulberry32 — small, fast, good enough for layout/content generation. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next(): number {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The factory seed formula: one seed per attempt, reproducible from the pair. */
export function makeSeed(dayIndex: number, attempt: number): number {
  return ((dayIndex * 7919) ^ (attempt * 104729)) >>> 0;
}

/** Integer in [min, max] inclusive. */
export function randInt(rnd: () => number, min: number, max: number): number {
  return min + Math.floor(rnd() * (max - min + 1));
}

/** Pick one element. The array must not be empty. */
export function pick<T>(rnd: () => number, items: readonly T[]): T {
  return items[Math.floor(rnd() * items.length) % items.length];
}

/** Fisher-Yates on a copy — the input is never mutated. */
export function shuffle<T>(rnd: () => number, items: readonly T[]): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}
