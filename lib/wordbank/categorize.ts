import { decayedMasteryScore } from "@/lib/srs/decay";

/** Matches lib/adaptive/recommend.ts's WEAK_THRESHOLD exactly — a word
 * counts as "weak" by the same definition the dashboard's recommendation
 * engine already uses, so the two surfaces never disagree. */
export const WEAK_THRESHOLD = 0.4;
export const MASTERED_THRESHOLD = 0.8;
export const MASTERED_REPETITIONS = 2;

export type WordBankCategory = "NEW" | "LEARNING" | "WEAK" | "FAMILIAR" | "MASTERED";

export type CategorizableMastery = {
  repetitions: number;
  masteryScore: number;
  intervalDays: number;
  nextReviewAt: Date;
  lastReviewedAt: Date | null;
};

/**
 * Derives a learner-facing word-bank bucket purely from existing
 * UserNodeMastery fields — no new "category" column, no duplicate source
 * of truth. A never-reviewed word is always New regardless of decay (decay
 * only applies once something has actually been reviewed at least once);
 * Weak overrides the repetition-based buckets below it, since a
 * previously-mastered word that's badly decayed should surface as Weak,
 * not stay labeled Mastered.
 */
export function categorizeWord(mastery: CategorizableMastery, now = new Date()): WordBankCategory {
  if (mastery.repetitions === 0 || mastery.lastReviewedAt === null) return "NEW";

  const decayed = decayedMasteryScore(
    mastery.masteryScore,
    mastery.intervalDays,
    mastery.nextReviewAt,
    now,
  );
  if (decayed < WEAK_THRESHOLD) return "WEAK";
  if (mastery.repetitions === 1) return "LEARNING";
  if (mastery.repetitions >= MASTERED_REPETITIONS && decayed >= MASTERED_THRESHOLD) {
    return "MASTERED";
  }
  return "FAMILIAR";
}
