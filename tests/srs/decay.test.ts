import { describe, it, expect } from "vitest";
import { decayedMasteryScore } from "@/lib/srs/decay";

describe("decayedMasteryScore", () => {
  it("returns the raw score unchanged when not yet due", () => {
    const now = new Date("2026-01-10T00:00:00Z");
    const nextReviewAt = new Date("2026-01-15T00:00:00Z");
    expect(decayedMasteryScore(0.8, 6, nextReviewAt, now)).toBe(0.8);
  });

  it("returns the raw score unchanged exactly at the due date", () => {
    const now = new Date("2026-01-10T00:00:00Z");
    expect(decayedMasteryScore(0.8, 6, now, now)).toBe(0.8);
  });

  it("halves the score after one half-life past due", () => {
    const nextReviewAt = new Date("2026-01-01T00:00:00Z");
    const now = new Date("2026-01-04T00:00:00Z"); // 3 days overdue, interval 3 -> one half-life
    expect(decayedMasteryScore(0.8, 3, nextReviewAt, now)).toBeCloseTo(0.4, 5);
  });

  it("decays faster for short intervals (less consolidated) than long ones", () => {
    const nextReviewAt = new Date("2026-01-01T00:00:00Z");
    const now = new Date("2026-01-06T00:00:00Z"); // 5 days overdue
    const shortInterval = decayedMasteryScore(0.8, 1, nextReviewAt, now);
    const longInterval = decayedMasteryScore(0.8, 30, nextReviewAt, now);
    expect(shortInterval).toBeLessThan(longInterval);
  });

  it("never decays below zero and approaches it for very overdue items", () => {
    const nextReviewAt = new Date("2026-01-01T00:00:00Z");
    const now = new Date("2026-06-01T00:00:00Z");
    const score = decayedMasteryScore(0.8, 1, nextReviewAt, now);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThan(0.01);
  });
});
