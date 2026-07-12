import { describe, it, expect } from "vitest";
import { categorizeWord, type CategorizableMastery } from "@/lib/wordbank/categorize";

const NOW = new Date("2026-01-10T00:00:00Z");

function mastery(overrides: Partial<CategorizableMastery>): CategorizableMastery {
  return {
    repetitions: 0,
    masteryScore: 0,
    intervalDays: 0,
    nextReviewAt: NOW,
    lastReviewedAt: null,
    ...overrides,
  };
}

describe("categorizeWord", () => {
  it("is New when never reviewed, regardless of repetitions", () => {
    expect(categorizeWord(mastery({ repetitions: 0, lastReviewedAt: null }), NOW)).toBe("NEW");
  });

  it("is Learning after exactly one successful review, still fresh", () => {
    const m = mastery({
      repetitions: 1,
      masteryScore: 0.6,
      intervalDays: 6,
      nextReviewAt: new Date("2026-01-20T00:00:00Z"), // not due yet -> no decay
      lastReviewedAt: new Date("2026-01-09T00:00:00Z"),
    });
    expect(categorizeWord(m, NOW)).toBe("LEARNING");
  });

  it("is Weak when badly decayed, even with 2+ repetitions", () => {
    const m = mastery({
      repetitions: 4,
      masteryScore: 0.8,
      intervalDays: 1, // short half-life -> decays fast once overdue
      nextReviewAt: new Date("2026-01-01T00:00:00Z"), // 9 days overdue
      lastReviewedAt: new Date("2025-12-31T00:00:00Z"),
    });
    expect(categorizeWord(m, NOW)).toBe("WEAK");
  });

  it("is Mastered with high repetitions and healthy decayed score", () => {
    const m = mastery({
      repetitions: 5,
      masteryScore: 1,
      intervalDays: 60,
      nextReviewAt: new Date("2026-02-01T00:00:00Z"), // not due -> no decay
      lastReviewedAt: new Date("2026-01-01T00:00:00Z"),
    });
    expect(categorizeWord(m, NOW)).toBe("MASTERED");
  });

  it("is Familiar with 2+ repetitions but not yet at the mastered decay bar", () => {
    const m = mastery({
      repetitions: 2,
      masteryScore: 0.5,
      intervalDays: 6,
      nextReviewAt: new Date("2026-01-15T00:00:00Z"), // not due -> no decay
      lastReviewedAt: new Date("2026-01-08T00:00:00Z"),
    });
    expect(categorizeWord(m, NOW)).toBe("FAMILIAR");
  });
});
