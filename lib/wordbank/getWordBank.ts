import { db } from "@/lib/db";
import { getMasteryRows } from "@/lib/stats";
import { categorizeWord, type WordBankCategory } from "@/lib/wordbank/categorize";
import type { VocabNodeData } from "@/lib/validation/knowledge";

export type WordBankEntry = {
  nodeId: string;
  script: string;
  romanization: string;
  english: string;
  audioKey: string | null;
  category: WordBankCategory;
  masteryScore: number;
  repetitions: number;
  lastReviewedAt: Date | null;
  nextReviewAt: Date;
  introducedIn: {
    lessonId: string;
    lessonTitle: string;
    moduleTitle: string;
    levelIndex: number;
  } | null;
  exampleSentence: { script: string; romanization: string; english: string } | null;
  practiceCount: number;
  recentAccuracy: number | null;
  hasRecurringMistake: boolean;
};

export type WordBankFilters = {
  category?: WordBankCategory;
  lessonId?: string;
  levelIndex?: number;
  search?: string;
};

type LessonRef = {
  id: string;
  title: string;
  index: number;
  module: { title: string; index: number; level: { index: number } };
};

/**
 * Every field here is derived from data that already exists elsewhere
 * (UserNodeMastery, KnowledgeNode, LessonNode, PracticeAttempt,
 * MistakeLog) — there is no new "word bank" table. Everything is scoped to
 * this user's own enrolled nodes (indexed on userId), never a full-graph
 * scan.
 */
export async function getWordBank(
  userId: string,
  filters: WordBankFilters = {},
): Promise<WordBankEntry[]> {
  const rows = await getMasteryRows(userId);
  const vocabRows = rows.filter((r) => r.node.type === "VOCAB");
  if (vocabRows.length === 0) return [];

  const nodeIds = vocabRows.map((r) => r.nodeId);

  const [vocabNodes, teachesLinks] = await Promise.all([
    // getMasteryRows only selects node.title/type (kept lean for its other,
    // hotter-path callers) — the word bank needs the full vocab payload
    // (romanization/english/audioKey), fetched here in one bounded query.
    db.knowledgeNode.findMany({
      where: { id: { in: nodeIds } },
      select: { id: true, data: true },
    }),
    db.lessonNode.findMany({
      where: { nodeId: { in: nodeIds }, role: "TEACHES" },
      select: {
        nodeId: true,
        lesson: {
          select: {
            id: true,
            title: true,
            index: true,
            module: {
              select: { title: true, index: true, level: { select: { index: true } } },
            },
          },
        },
      },
    }),
  ]);

  const vocabDataById = new Map(
    vocabNodes.map((n) => [n.id, n.data as unknown as VocabNodeData]),
  );

  // A word taught in two lessons gets a TEACHES link on both — pick the
  // earliest by (level, module, lesson) index as "introduced in".
  const introducedInByNode = new Map<string, LessonRef>();
  for (const link of teachesLinks) {
    const existing = introducedInByNode.get(link.nodeId);
    if (!existing || isEarlier(link.lesson, existing)) {
      introducedInByNode.set(link.nodeId, link.lesson);
    }
  }

  const introducingLessonIds = [
    ...new Set([...introducedInByNode.values()].map((l) => l.id)),
  ];

  // Example sentences: dialogue-line SENTENCE_PATTERN nodes linked to the
  // same lesson that introduced the word, matched by substring — no new
  // schema, reuses the sentence nodes already created by the import
  // pipeline for every dialogue line.
  const sentenceLinks = introducingLessonIds.length
    ? await db.lessonNode.findMany({
        where: {
          lessonId: { in: introducingLessonIds },
          role: "REVIEWS",
          node: { type: "SENTENCE_PATTERN" },
        },
        select: { lessonId: true, node: { select: { data: true } } },
      })
    : [];
  const sentencesByLesson = new Map<
    string,
    { script: string; romanization: string; english: string }[]
  >();
  for (const link of sentenceLinks) {
    const list = sentencesByLesson.get(link.lessonId) ?? [];
    list.push(link.node.data as { script: string; romanization: string; english: string });
    sentencesByLesson.set(link.lessonId, list);
  }

  const [practiceTotals, practiceCorrect, mistakeCounts] = await Promise.all([
    db.practiceAttempt.groupBy({
      by: ["nodeId"],
      where: { userId, nodeId: { in: nodeIds } },
      _count: { nodeId: true },
    }),
    db.practiceAttempt.groupBy({
      by: ["nodeId"],
      where: { userId, nodeId: { in: nodeIds }, correct: true },
      _count: { nodeId: true },
    }),
    db.mistakeLog.groupBy({
      by: ["nodeId"],
      where: { userId, nodeId: { in: nodeIds } },
      _count: { nodeId: true },
    }),
  ]);
  const totalByNode = new Map(practiceTotals.map((p) => [p.nodeId, p._count.nodeId]));
  const correctByNode = new Map(practiceCorrect.map((p) => [p.nodeId, p._count.nodeId]));
  const mistakeCountByNode = new Map(
    mistakeCounts
      .filter((m) => m.nodeId !== null)
      .map((m) => [m.nodeId as string, m._count.nodeId]),
  );

  const entries: WordBankEntry[] = vocabRows.map((row) => {
    const vocabData = vocabDataById.get(row.nodeId);
    const introLesson = introducedInByNode.get(row.nodeId) ?? null;
    const sentences = introLesson ? (sentencesByLesson.get(introLesson.id) ?? []) : [];
    const bestSentence =
      sentences.find((s) => vocabData && s.script.includes(vocabData.script)) ??
      sentences[0] ??
      null;
    const total = totalByNode.get(row.nodeId) ?? 0;
    const correct = correctByNode.get(row.nodeId) ?? 0;

    return {
      nodeId: row.nodeId,
      script: vocabData?.script ?? row.node.title,
      romanization: vocabData?.romanization ?? "",
      english: vocabData?.english ?? "",
      audioKey: vocabData?.audioKey ?? null,
      category: categorizeWord(row),
      masteryScore: row.masteryScore,
      repetitions: row.repetitions,
      lastReviewedAt: row.lastReviewedAt,
      nextReviewAt: row.nextReviewAt,
      introducedIn: introLesson
        ? {
            lessonId: introLesson.id,
            lessonTitle: introLesson.title,
            moduleTitle: introLesson.module.title,
            levelIndex: introLesson.module.level.index,
          }
        : null,
      exampleSentence: bestSentence,
      practiceCount: total,
      recentAccuracy: total > 0 ? correct / total : null,
      hasRecurringMistake: (mistakeCountByNode.get(row.nodeId) ?? 0) >= 2,
    };
  });

  return entries.filter((e) => matchesFilters(e, filters));
}

function isEarlier(a: LessonRef, b: LessonRef): boolean {
  if (a.module.level.index !== b.module.level.index) {
    return a.module.level.index < b.module.level.index;
  }
  if (a.module.index !== b.module.index) return a.module.index < b.module.index;
  return a.index < b.index;
}

function matchesFilters(entry: WordBankEntry, filters: WordBankFilters): boolean {
  if (filters.category && entry.category !== filters.category) return false;
  if (filters.lessonId && entry.introducedIn?.lessonId !== filters.lessonId) return false;
  if (filters.levelIndex !== undefined && entry.introducedIn?.levelIndex !== filters.levelIndex) {
    return false;
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    const haystack = `${entry.script} ${entry.romanization} ${entry.english}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
}
