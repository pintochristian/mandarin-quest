import { describe, it, expect } from "vitest";
import { createRng, seededShuffle, seededSample } from "@/lib/practice/seededRandom";

describe("createRng", () => {
  it("is deterministic for the same seed", () => {
    const a = createRng("session-1:node-42");
    const b = createRng("session-1:node-42");
    const seqA = [a(), a(), a()];
    const seqB = [b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it("produces different sequences for different seeds", () => {
    const a = createRng("session-1");
    const b = createRng("session-2");
    expect(a()).not.toBe(b());
  });

  it("always returns values in [0, 1)", () => {
    const rand = createRng("range-check");
    for (let i = 0; i < 100; i++) {
      const v = rand();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("seededShuffle", () => {
  it("preserves every element (no loss/duplication)", () => {
    const items = [1, 2, 3, 4, 5];
    const shuffled = seededShuffle(items, createRng("shuffle-1"));
    expect([...shuffled].sort()).toEqual(items);
  });

  it("is deterministic for the same seed", () => {
    const items = ["a", "b", "c", "d"];
    const a = seededShuffle(items, createRng("shuffle-seed"));
    const b = seededShuffle(items, createRng("shuffle-seed"));
    expect(a).toEqual(b);
  });
});

describe("seededSample", () => {
  it("returns exactly n unique items when the pool is large enough", () => {
    const items = Array.from({ length: 20 }, (_, i) => i);
    const sample = seededSample(items, 5, createRng("sample-1"));
    expect(sample).toHaveLength(5);
    expect(new Set(sample).size).toBe(5);
  });

  it("caps at the pool size when n exceeds it", () => {
    const items = [1, 2, 3];
    const sample = seededSample(items, 10, createRng("sample-2"));
    expect(sample).toHaveLength(3);
  });
});
