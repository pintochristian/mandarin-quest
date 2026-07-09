import { db } from "@/lib/db";
import { decayedMasteryScore } from "@/lib/srs/decay";
import type { KnowledgeNodeType } from "@/lib/generated/prisma/enums";

/** An SRS item counts as "mastered" once it's survived 2+ successful reviews. */
const MASTERED_REPETITIONS = 2;

async function masteryRatio(userId: string, nodeType: KnowledgeNodeType) {
  const items = await db.userNodeMastery.findMany({
    where: { userId, node: { type: nodeType } },
    select: { repetitions: true },
  });
  if (items.length === 0) return 0;
  const mastered = items.filter((i) => i.repetitions >= MASTERED_REPETITIONS).length;
  return mastered / items.length;
}

export type UserStats = {
  grammarMastery: number; // 0-1
  vocabularyMastery: number; // 0-1
  listeningMastery: number; // 0-1, derived from dialogue-sentence recall
  conversationMastery: number; // 0-1, composite of the three above
  pronunciationScore: number; // 0-1, average SpeakingAttempt accuracy
  wordsLearned: number;
  grammarRulesMastered: number;
};

export async function getUserStats(userId: string): Promise<UserStats> {
  const [
    grammarMastery,
    vocabularyMastery,
    listeningMastery,
    speakingAttempts,
    wordsLearned,
    grammarItems,
  ] = await Promise.all([
    masteryRatio(userId, "GRAMMAR"),
    masteryRatio(userId, "VOCAB"),
    masteryRatio(userId, "SENTENCE_PATTERN"),
    db.speakingAttempt.findMany({ where: { userId }, select: { accuracyScore: true } }),
    db.userNodeMastery.count({ where: { userId, node: { type: "VOCAB" } } }),
    db.userNodeMastery.findMany({
      where: { userId, node: { type: "GRAMMAR" } },
      select: { repetitions: true },
    }),
  ]);

  const pronunciationScore =
    speakingAttempts.length === 0
      ? 0
      : speakingAttempts.reduce((sum, a) => sum + (a.accuracyScore ?? 0), 0) /
        speakingAttempts.length;

  const grammarRulesMastered = grammarItems.filter(
    (g) => g.repetitions >= MASTERED_REPETITIONS,
  ).length;

  return {
    grammarMastery,
    vocabularyMastery,
    listeningMastery,
    conversationMastery: (grammarMastery + vocabularyMastery + listeningMastery) / 3,
    pronunciationScore,
    wordsLearned,
    grammarRulesMastered,
  };
}

export type MemoryScore = {
  overall: number; // 0-1, composite of every sub-score below
  grammar: number; // 0-1, decay-adjusted
  vocabulary: number; // 0-1, decay-adjusted
  listening: number; // 0-1, decay-adjusted (from SENTENCE_PATTERN nodes)
  conversation: number; // 0-1, composite of grammar/vocabulary/listening
  pronunciation: number; // 0-1, average SpeakingAttempt accuracy
  reviewHealth: number; // 0-1: how much stored mastery survives decay right now
};

/**
 * Unlike `getUserStats` (which reports raw SM-2 mastery ratios), every
 * sub-score here is decay-adjusted at read time (lib/srs/decay.ts) — a word
 * mastered months ago but never reviewed since scores lower here than in
 * the raw stats, which is the point: this is meant to answer "how much do
 * I actually still know right now," not "how much did I ever learn."
 */
export async function getMemoryScore(userId: string): Promise<MemoryScore> {
  const [masteries, speakingAttempts] = await Promise.all([
    db.userNodeMastery.findMany({
      where: { userId },
      select: {
        masteryScore: true,
        intervalDays: true,
        nextReviewAt: true,
        node: { select: { type: true } },
      },
    }),
    db.speakingAttempt.findMany({ where: { userId }, select: { accuracyScore: true } }),
  ]);

  const now = new Date();
  const decayedByType = (types: KnowledgeNodeType[]) => {
    const items = masteries.filter((m) => types.includes(m.node.type));
    if (items.length === 0) return 0;
    const sum = items.reduce(
      (s, m) => s + decayedMasteryScore(m.masteryScore, m.intervalDays, m.nextReviewAt, now),
      0,
    );
    return sum / items.length;
  };

  const grammar = decayedByType(["GRAMMAR"]);
  const vocabulary = decayedByType(["VOCAB"]);
  const listening = decayedByType(["SENTENCE_PATTERN"]);
  const conversation = (grammar + vocabulary + listening) / 3;
  const pronunciation =
    speakingAttempts.length === 0
      ? 0
      : speakingAttempts.reduce((s, a) => s + (a.accuracyScore ?? 0), 0) /
        speakingAttempts.length;

  const reviewHealth =
    masteries.length === 0
      ? 1
      : masteries.reduce((sum, m) => {
          const decayed = decayedMasteryScore(
            m.masteryScore,
            m.intervalDays,
            m.nextReviewAt,
            now,
          );
          const raw = Math.max(m.masteryScore, 1e-6);
          return sum + Math.min(1, decayed / raw);
        }, 0) / masteries.length;

  const overall = (grammar + vocabulary + listening + pronunciation + reviewHealth) / 5;

  return { overall, grammar, vocabulary, listening, conversation, pronunciation, reviewHealth };
}
