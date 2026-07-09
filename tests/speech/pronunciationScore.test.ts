import { describe, it, expect } from "vitest";
import { heuristicScorer } from "@/lib/speech/pronunciationScore";

describe("heuristicScorer", () => {
  it("scores an exact match at 100% accuracy", () => {
    const result = heuristicScorer.score({ transcript: "你好", targetScript: "你好" });
    expect(result.accuracyScore).toBe(1);
    expect(result.isHeuristic).toBe(true);
  });

  it("scores a completely different transcript near 0%", () => {
    const result = heuristicScorer.score({ transcript: "再见", targetScript: "你好" });
    expect(result.accuracyScore).toBeLessThan(0.5);
  });

  it("gives partial credit for a close match", () => {
    const result = heuristicScorer.score({
      transcript: "我叫大卫",
      targetScript: "我叫大为",
    });
    expect(result.accuracyScore).toBeGreaterThan(0.5);
    expect(result.accuracyScore).toBeLessThan(1);
  });

  it("ignores punctuation and whitespace differences", () => {
    const result = heuristicScorer.score({
      transcript: "你好 !",
      targetScript: "你好!",
    });
    expect(result.accuracyScore).toBe(1);
  });

  it("keeps the tone score at or below the accuracy score (it is a conservative proxy)", () => {
    const result = heuristicScorer.score({ transcript: "你好", targetScript: "你好" });
    expect(result.toneScore).toBeLessThanOrEqual(result.accuracyScore);
  });

  it("handles an empty target gracefully", () => {
    const result = heuristicScorer.score({ transcript: "你好", targetScript: "" });
    expect(result.accuracyScore).toBe(0);
  });
});
