import { db } from "@/lib/db";
import { INITIAL_SM2_STATE, nextReviewDate, sm2 } from "@/lib/srs/sm2";
import type { KnowledgeNodeType } from "@/lib/generated/prisma/enums";

export type DueReviewItem = {
  id: string;
  nodeId: string;
  nodeType: KnowledgeNodeType;
  repetitions: number;
  nextReviewAt: Date;
  prompt: { script: string; romanization: string; english: string };
};

/**
 * Enrolls every node a lesson teaches or reviews (vocabulary, the primary
 * grammar concept, and every dialogue sentence — anything linked via
 * LessonNode) into the learner's review queue. Existing UserNodeMastery
 * rows (from a prior completion, or from a word reappearing in a later
 * lesson) are left untouched so in-progress SM-2 scheduling isn't reset by
 * redoing a lesson or re-encountering a word.
 */
export async function enrollLessonReviewItems(userId: string, lessonId: string) {
  const lessonNodes = await db.lessonNode.findMany({
    where: { lessonId, role: { in: ["TEACHES", "REVIEWS"] } },
    select: { nodeId: true },
  });

  const now = new Date();
  await Promise.all(
    lessonNodes.map(({ nodeId }) =>
      db.userNodeMastery.upsert({
        where: { userId_nodeId: { userId, nodeId } },
        update: {},
        create: {
          userId,
          nodeId,
          ...INITIAL_SM2_STATE,
          nextReviewAt: now,
        },
      }),
    ),
  );

  return lessonNodes.length;
}

function resolvePrompt(
  type: KnowledgeNodeType,
  title: string,
  data: unknown,
): { script: string; romanization: string; english: string } {
  if (type === "VOCAB" || type === "SENTENCE_PATTERN") {
    const d = data as { script: string; romanization: string; english: string };
    return { script: d.script, romanization: d.romanization, english: d.english };
  }
  if (type === "GRAMMAR") {
    const d = data as { simpleExplanation: string };
    return { script: title, romanization: "", english: d.simpleExplanation };
  }
  return { script: title, romanization: "", english: title };
}

export async function getDueReviewItems(
  userId: string,
  limit = 30,
): Promise<DueReviewItem[]> {
  const dueItems = await db.userNodeMastery.findMany({
    where: { userId, nextReviewAt: { lte: new Date() } },
    orderBy: { nextReviewAt: "asc" },
    take: limit,
    include: { node: true },
  });

  return dueItems.map((item) => ({
    id: item.id,
    nodeId: item.nodeId,
    nodeType: item.node.type,
    repetitions: item.repetitions,
    nextReviewAt: item.nextReviewAt,
    prompt: resolvePrompt(item.node.type, item.node.title, item.node.data),
  }));
}

export async function countDueReviewItems(userId: string): Promise<number> {
  return db.userNodeMastery.count({ where: { userId, nextReviewAt: { lte: new Date() } } });
}

export async function submitReview(
  masteryId: string,
  userId: string,
  quality: number,
  responseTimeMs?: number,
) {
  const item = await db.userNodeMastery.findUniqueOrThrow({
    where: { id: masteryId },
  });
  if (item.userId !== userId) {
    throw new Error("Review item does not belong to this user");
  }

  const nextState = sm2(
    {
      easeFactor: item.easeFactor,
      intervalDays: item.intervalDays,
      repetitions: item.repetitions,
      lapses: item.lapses,
    },
    quality,
  );
  const nextReviewAt = nextReviewDate(nextState.intervalDays);
  // A basic confidence signal: nudge toward 1 on success, snap toward 0 on
  // a lapse. Phase 11 replaces this with a proper time-decayed Memory Score.
  const confidenceScore =
    quality >= 3
      ? Math.min(1, item.confidenceScore + 0.15)
      : Math.max(0, item.confidenceScore - 0.3);
  const masteryScore = Math.min(1, nextState.repetitions / 5);

  const [updated] = await Promise.all([
    db.userNodeMastery.update({
      where: { id: masteryId },
      data: {
        ...nextState,
        nextReviewAt,
        lastReviewedAt: new Date(),
        confidenceScore,
        masteryScore,
      },
    }),
    db.userNodeMasteryLog.create({
      data: { masteryId, quality, responseTimeMs },
    }),
  ]);

  return updated;
}
