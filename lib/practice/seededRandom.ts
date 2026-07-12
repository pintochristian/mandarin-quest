/**
 * Small deterministic PRNG so practice-session generation is reproducible
 * for a given seed (testable) while still varying session to session in
 * real use (the seed always includes the session id). Not cryptographic —
 * just needs to be a stable, even-ish distribution.
 */
function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function createRng(seed: string): () => number {
  let state = hashSeed(seed) || 1;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates shuffle using a seeded RNG — deterministic for the same rng state. */
export function seededShuffle<T>(items: T[], rand: () => number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Sample up to n items without replacement using a seeded RNG. */
export function seededSample<T>(items: T[], n: number, rand: () => number): T[] {
  return seededShuffle(items, rand).slice(0, Math.max(0, n));
}
