import { describe, it, expect } from "vitest";
import { sm2, nextReviewDate, INITIAL_SM2_STATE } from "@/lib/srs/sm2";

describe("sm2", () => {
  it("resets repetitions and sets a 1-day interval on failure (quality < 3)", () => {
    const state = { easeFactor: 2.5, intervalDays: 10, repetitions: 3, lapses: 0 };
    const next = sm2(state, 1);
    expect(next.repetitions).toBe(0);
    expect(next.intervalDays).toBe(1);
    expect(next.lapses).toBe(1);
  });

  it("first successful review sets interval to 1 day", () => {
    const next = sm2(INITIAL_SM2_STATE, 4);
    expect(next.repetitions).toBe(1);
    expect(next.intervalDays).toBe(1);
  });

  it("second successful review sets interval to 6 days", () => {
    const afterFirst = sm2(INITIAL_SM2_STATE, 4);
    const afterSecond = sm2(afterFirst, 4);
    expect(afterSecond.repetitions).toBe(2);
    expect(afterSecond.intervalDays).toBe(6);
  });

  it("third+ successful review multiplies the interval by the ease factor", () => {
    let state = INITIAL_SM2_STATE;
    state = sm2(state, 4);
    state = sm2(state, 4);
    const third = sm2(state, 4);
    expect(third.repetitions).toBe(3);
    expect(third.intervalDays).toBe(Math.round(state.intervalDays * third.easeFactor));
  });

  it("never lets the ease factor drop below 1.3", () => {
    let state = INITIAL_SM2_STATE;
    for (let i = 0; i < 20; i++) {
      state = sm2(state, 0);
    }
    expect(state.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  it("increases the ease factor for easy (quality 5) reviews", () => {
    const next = sm2(INITIAL_SM2_STATE, 5);
    expect(next.easeFactor).toBeGreaterThan(INITIAL_SM2_STATE.easeFactor);
  });

  it("rejects out-of-range quality values", () => {
    expect(() => sm2(INITIAL_SM2_STATE, 6)).toThrow();
    expect(() => sm2(INITIAL_SM2_STATE, -1)).toThrow();
    expect(() => sm2(INITIAL_SM2_STATE, 2.5)).toThrow();
  });
});

describe("nextReviewDate", () => {
  it("adds the given number of days to the reference date", () => {
    const from = new Date("2026-01-01T00:00:00Z");
    const result = nextReviewDate(6, from);
    expect(result.getUTCDate()).toBe(7);
  });
});
