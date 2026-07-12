import { cache } from "react";
import { db } from "@/lib/db";
import { decayedMasteryScore } from "@/lib/srs/decay";
import type { KnowledgeNodeType } from "@/lib/generated/prisma/enums";

/** An SRS item counts as "mastered" once it's survived 2+ successful reviews. */
const MASTERED_REPETITIONS = 2;

export type MasteryRow = {
  nodeId: string;
  repetitions: number;
  masteryScore: number;
  intervalDays: number;
  nextReviewAt: Date;
  lastReviewedAt: Date | null;
  createdAt: Date;
  node: { title: string; type: KnowledgeNodeType };
};

/**
 * Both getUserStats/getMemoryScore (this file) and getWeakNodes
 * (lib/adaptive/recommend.ts) need "this user's UserNodeMastery rows" —
 * previously each fetched its own copy, costing an extra full-table query
 * whenever a request touched both (e.g. Home calls getUserStats and, via
 * getNextLesson, getWeakNodes). `cache()` is React's per-request dedup: the
 * underlying Prisma query runs once per request no matter how many of these
 * callers use it, and never leaks between users/requests the way a
 * module-level cache would.
 */
export const getMasteryRows = cache((userId: string): Promise<MasteryRow[]> =>
  db.userNodeMastery.findMany({
    where: { userId },
    select: {
      nodeId: true,
      repetitions: true,
      masteryScore: true,
      intervalDays: true,
      nextReviewAt: true,
      lastReviewedAt: true,
      createdAt: true,
      node: { select: { title: true, type: true } },
    },
  }),
);

const getSpeakingAttempts = cache((userId: string) =>
  db.speakingAttempt.findMany({ where: { userId }, select: { accuracyScore: true } }),
);

function byType(rows: MasteryRow[], type: KnowledgeNodeType) {
  return rows.filter((r) => r.node.type === type);
}

function masteryRatio(rows: MasteryRow[]) {
  if (rows.length === 0) return 0;
  return rows.filter((r) => r.repetitions >= MASTERED_REPETITIONS).length / rows.length;
}

function pronunciationFrom(attempts: { accuracyScore: number | null }[]) {
  if (attempts.length === 0) return 0;
  return attempts.reduce((sum, a) => sum + (a.accuracyScore ?? 0), 0) / attempts.length;
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
  const [rows, speakingAttempts] = await Promise.all([
    getMasteryRows(userId),
    getSpeakingAttempts(userId),
  ]);

  const grammarRows = byType(rows, "GRAMMAR");
  const vocabRows = byType(rows, "VOCAB");
  const listeningRows = byType(rows, "SENTENCE_PATTERN");

  const grammarMastery = masteryRatio(grammarRows);
  const vocabularyMastery = masteryRatio(vocabRows);
  const listeningMastery = masteryRatio(listeningRows);

  return {
    grammarMastery,
    vocabularyMastery,
    listeningMastery,
    conversationMastery: (grammarMastery + vocabularyMastery + listeningMastery) / 3,
    pronunciationScore: pronunciationFrom(speakingAttempts),
    wordsLearned: vocabRows.length,
    grammarRulesMastered: grammarRows.filter((r) => r.repetitions >= MASTERED_REPETITIONS)
      .length,
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
  const [rows, speakingAttempts] = await Promise.all([
    getMasteryRows(userId),
    getSpeakingAttempts(userId),
  ]);

  const now = new Date();
  const decayedByType = (type: KnowledgeNodeType) => {
    const items = byType(rows, type);
    if (items.length === 0) return 0;
    const sum = items.reduce(
      (s, m) => s + decayedMasteryScore(m.masteryScore, m.intervalDays, m.nextReviewAt, now),
      0,
    );
    return sum / items.length;
  };

  const grammar = decayedByType("GRAMMAR");
  const vocabulary = decayedByType("VOCAB");
  const listening = decayedByType("SENTENCE_PATTERN");
  const conversation = (grammar + vocabulary + listening) / 3;
  const pronunciation = pronunciationFrom(speakingAttempts);

  const reviewHealth =
    rows.length === 0
      ? 1
      : rows.reduce((sum, m) => {
          const decayed = decayedMasteryScore(
            m.masteryScore,
            m.intervalDays,
            m.nextReviewAt,
            now,
          );
          const raw = Math.max(m.masteryScore, 1e-6);
          return sum + Math.min(1, decayed / raw);
        }, 0) / rows.length;

  const overall = (grammar + vocabulary + listening + pronunciation + reviewHealth) / 5;

  return { overall, grammar, vocabulary, listening, conversation, pronunciation, reviewHealth };
}
