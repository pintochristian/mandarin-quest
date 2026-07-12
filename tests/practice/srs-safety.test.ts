import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Enforces the core SRS-safety invariant from the Practice Anytime design:
 * voluntary practice must never be able to move UserNodeMastery's SRS
 * fields (nextReviewAt/intervalDays/repetitions/lapses/easeFactor). The
 * project's test setup has no DB-integration harness (every other test is
 * a pure-function test), so this checks it the way that's actually
 * enforceable here: the attempt-logging route and the session-generation
 * module must contain no reference to db.userNodeMastery at all. If either
 * ever starts writing to UserNodeMastery, this test fails immediately
 * rather than relying on someone noticing in review.
 */
function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("Practice Anytime SRS safety", () => {
  it("the attempt-logging route never touches userNodeMastery", () => {
    const source = readSource("app/api/practice/attempt/route.ts");
    expect(source).toContain("practiceAttempt.create");
    // Explanatory comments may mention UserNodeMastery by name (to document
    // why it's deliberately absent) — what must never appear is an actual
    // db.userNodeMastery.* call.
    expect(source).not.toMatch(/db\.userNodeMastery\./);
  });

  it("practice session generation never writes to userNodeMastery", () => {
    const source = readSource("lib/practice/session.ts");
    // Reading UserNodeMastery-derived rows via getMasteryRows is expected
    // (that's how eligible practice pools are resolved) — what must never
    // appear is a direct write.
    expect(source).not.toMatch(/db\.userNodeMastery\.(update|upsert|create|delete)/);
  });

  it("submitReview (Daily Review) remains the only writer of SRS fields", () => {
    const source = readSource("lib/srs/queue.ts");
    expect(source).toContain("userNodeMastery.update");
  });
});
