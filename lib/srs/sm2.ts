/**
 * SM-2 (SuperMemo 2) spaced-repetition scheduling — the same family of
 * algorithm Anki uses. Every KnowledgeNode type (vocabulary, grammar,
 * sentence patterns, ...) shares this one scheduler via UserNodeMastery.
 */

export type Sm2State = {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  lapses: number;
};

export const INITIAL_SM2_STATE: Sm2State = {
  easeFactor: 2.5,
  intervalDays: 0,
  repetitions: 0,
  lapses: 0,
};

const MIN_EASE_FACTOR = 1.3;

/**
 * @param quality 0-5 grading scale: 0-2 = failed/forgot, 3 = hard but
 * recalled, 4 = good, 5 = easy. Below 3 resets the repetition streak.
 */
export function sm2(state: Sm2State, quality: number): Sm2State {
  if (quality < 0 || quality > 5 || !Number.isInteger(quality)) {
    throw new Error(`sm2 quality must be an integer 0-5, got ${quality}`);
  }

  const failed = quality < 3;

  const easeFactor = Math.max(
    MIN_EASE_FACTOR,
    state.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  );

  if (failed) {
    return {
      easeFactor,
      intervalDays: 1,
      repetitions: 0,
      lapses: state.lapses + 1,
    };
  }

  const repetitions = state.repetitions + 1;
  let intervalDays: number;
  if (repetitions === 1) {
    intervalDays = 1;
  } else if (repetitions === 2) {
    intervalDays = 6;
  } else {
    intervalDays = Math.round(state.intervalDays * easeFactor);
  }

  return { easeFactor, intervalDays, repetitions, lapses: state.lapses };
}

export function nextReviewDate(intervalDays: number, from: Date = new Date()): Date {
  const next = new Date(from);
  next.setDate(next.getDate() + intervalDays);
  return next;
}
