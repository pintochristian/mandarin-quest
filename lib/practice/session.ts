import { db } from "@/lib/db";
import { getMasteryRows, type MasteryRow } from "@/lib/stats";
import { getNodesWithRecurringMistakes } from "@/lib/mistakes/analyze";
import { decayedMasteryScore } from "@/lib/srs/decay";
import { getRecentPracticeHistory } from "@/lib/practice/history";
import {
  synthesizeVocabQuestion,
  synthesizeGrammarQuestion,
  VOCAB_FORMATS,
  type PracticeNode,
  type PracticeQuestion,
} from "@/lib/practice/synthesize";
import { createRng } from "@/lib/practice/seededRandom";

export type PracticeSource =
  | { kind: "ALL" }
  | { kind: "WEAK" }
  | { kind: "RECENT" }
  | { kind: "MASTERED" }
  | { kind: "LESSON"; lessonId: string }
  | { kind: "MODULE"; moduleId: string }
  | { kind: "LEVEL"; levelIndex: number }
  | { kind: "CUSTOM"; nodeIds: string[] }
  | { kind: "MISTAKES" };

const WEAK_THRESHOLD = 0.4;
const MASTERED_THRESHOLD = 0.8;
const DUE_SOON_MS = 48 * 60 * 60 * 1000;
const MASTERED_TIER_CAP_RATIO = 0.15;
const RECENT_REPEAT_PENALTY = 0.3;

/** Only these two node types have a synthesis path today (see
 * lib/practice/synthesize.ts) — SENTENCE_PATTERN and the other graph node
 * types are a natural follow-up, not required for this pass. */
const SYNTHESIZABLE_TYPES = new Set(["VOCAB", "GRAMMAR"]);

/**
 * Generates a fresh Practice Anytime session: resolves an eligible node
 * pool for the requested source (always scoped to nodes this learner has
 * actually been enrolled in — never the whole knowledge graph, never a
 * node the learner hasn't encountered), weights it, samples without
 * replacement (seeded, so it's deterministic for tests but varies session
 * to session in real use), and synthesizes one question per selected node.
 */
export async function generatePracticeSession(
  userId: string,
  source: PracticeSource,
  length: number,
  sessionId: string,
): Promise<PracticeQuestion[]> {
  const allRows = await getMasteryRows(userId);
  const synthesizable = allRows.filter((r) => SYNTHESIZABLE_TYPES.has(r.node.type));

  const pool = await resolvePool(userId, source, synthesizable);
  if (pool.length === 0) return [];

  const history = await getRecentPracticeHistory(userId);
  const now = new Date();
  const rand = createRng(`${sessionId}:select`);

  const ranked = pool
    .map((row) => {
      const weight = computeWeight(row, history.recentAccuracyByNode, now);
      const penalty = history.recentlySeenNodeIds.includes(row.nodeId)
        ? RECENT_REPEAT_PENALTY
        : 1;
      const effectiveWeight = Math.max(weight * penalty, 0.01);
      // Efraimidis-Spirakis weighted sampling without replacement: each
      // item gets a key of rand()^(1/weight); taking the top-N by key is
      // equivalent to a weighted random sample without replacement.
      const key = Math.pow(rand(), 1 / effectiveWeight);
      return { row, weight, key };
    })
    .sort((a, b) => b.key - a.key);

  const masteredCap = Math.max(1, Math.ceil(length * MASTERED_TIER_CAP_RATIO));
  const selected: MasteryRow[] = [];
  let masteredCount = 0;
  for (const { row, weight } of ranked) {
    if (selected.length >= length) break;
    if (weight === 1) {
      if (masteredCount >= masteredCap) continue;
      masteredCount += 1;
    }
    selected.push(row);
  }
  // Pool too small to fill the session at the cap — top up with whatever's
  // left rather than return a short session.
  if (selected.length < length) {
    for (const { row } of ranked) {
      if (selected.length >= length) break;
      if (!selected.includes(row)) selected.push(row);
    }
  }

  // Fetch full node payloads once for the whole pool (bounded to this
  // user's own enrolled nodes) — reused both for the selected questions
  // and as the distractor source, so distractors are always things the
  // learner has already studied.
  const poolNodes = await fetchPracticeNodes(pool.map((r) => r.nodeId));
  const poolByType = groupByType(poolNodes);
  const nodeById = new Map(poolNodes.map((n) => [n.id, n]));

  let lastVocabFormat: string | null = null;
  const questions: PracticeQuestion[] = [];
  for (const row of selected) {
    const node = nodeById.get(row.nodeId);
    if (!node) continue;

    if (node.type === "GRAMMAR") {
      const q = synthesizeGrammarQuestion(node, `${sessionId}:${node.id}`);
      if (q) questions.push(q);
      continue;
    }

    const format = VOCAB_FORMATS.find((f) => f !== lastVocabFormat) ?? VOCAB_FORMATS[0];
    const q = synthesizeVocabQuestion(
      node,
      format,
      poolByType.get("VOCAB") ?? [],
      `${sessionId}:${node.id}`,
    );
    if (q) {
      questions.push(q);
      lastVocabFormat = format;
    }
  }

  return questions;
}

async function resolvePool(
  userId: string,
  source: PracticeSource,
  rows: MasteryRow[],
): Promise<MasteryRow[]> {
  const now = new Date();
  switch (source.kind) {
    case "ALL":
      return rows;
    case "WEAK":
      return rows.filter(
        (r) =>
          r.lastReviewedAt !== null &&
          decayedMasteryScore(r.masteryScore, r.intervalDays, r.nextReviewAt, now) <
            WEAK_THRESHOLD,
      );
    case "RECENT":
      return rows.filter((r) => r.repetitions <= 1);
    case "MASTERED":
      return rows.filter(
        (r) =>
          r.repetitions >= 2 &&
          decayedMasteryScore(r.masteryScore, r.intervalDays, r.nextReviewAt, now) >=
            MASTERED_THRESHOLD,
      );
    case "MISTAKES": {
      const mistakeNodes = await getNodesWithRecurringMistakes(userId, 20);
      const ids = new Set(mistakeNodes.map((n) => n.nodeId));
      return rows.filter((r) => ids.has(r.nodeId));
    }
    case "CUSTOM": {
      const ids = new Set(source.nodeIds);
      return rows.filter((r) => ids.has(r.nodeId));
    }
    case "LESSON": {
      const ids = await scopedNodeIds({ lessonId: source.lessonId });
      return rows.filter((r) => ids.has(r.nodeId));
    }
    case "MODULE": {
      const ids = await scopedNodeIds({ moduleId: source.moduleId });
      return rows.filter((r) => ids.has(r.nodeId));
    }
    case "LEVEL": {
      const ids = await scopedNodeIds({ levelIndex: source.levelIndex });
      return rows.filter((r) => ids.has(r.nodeId));
    }
  }
}

async function scopedNodeIds(
  scope: { lessonId: string } | { moduleId: string } | { levelIndex: number },
): Promise<Set<string>> {
  const where =
    "lessonId" in scope
      ? { lessonId: scope.lessonId }
      : "moduleId" in scope
        ? { lesson: { moduleId: scope.moduleId } }
        : { lesson: { module: { level: { index: scope.levelIndex } } } };
  const links = await db.lessonNode.findMany({
    where: { ...where, role: { in: ["TEACHES", "REVIEWS"] } },
    select: { nodeId: true },
  });
  return new Set(links.map((l) => l.nodeId));
}

function computeWeight(
  row: MasteryRow,
  recentAccuracyByNode: Map<string, number>,
  now: Date,
): number {
  const decayed = decayedMasteryScore(row.masteryScore, row.intervalDays, row.nextReviewAt, now);
  const recentAccuracy = recentAccuracyByNode.get(row.nodeId);
  const recentlyFailed = recentAccuracy !== undefined && recentAccuracy < 0.5;
  const isWeak = row.lastReviewedAt !== null && decayed < WEAK_THRESHOLD;
  if (recentlyFailed || isWeak) return 5;
  if (row.repetitions <= 1) return 4;
  if (row.nextReviewAt.getTime() - now.getTime() <= DUE_SOON_MS) return 3;
  if (row.repetitions >= 2 && decayed < MASTERED_THRESHOLD) return 2;
  return 1;
}

async function fetchPracticeNodes(nodeIds: string[]): Promise<PracticeNode[]> {
  if (nodeIds.length === 0) return [];
  const nodes = await db.knowledgeNode.findMany({
    where: { id: { in: nodeIds } },
    select: { id: true, type: true, title: true, data: true },
  });
  return nodes;
}

function groupByType(nodes: PracticeNode[]): Map<string, PracticeNode[]> {
  const map = new Map<string, PracticeNode[]>();
  for (const n of nodes) {
    const list = map.get(n.type) ?? [];
    list.push(n);
    map.set(n.type, list);
  }
  return map;
}
