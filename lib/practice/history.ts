import { db } from "@/lib/db";

const RECENT_WINDOW = 40;

export type RecentPracticeHistory = {
  /** nodeIds seen in the last RECENT_WINDOW attempts, most recent first —
   * used to deprioritize immediate repeats across sessions. */
  recentlySeenNodeIds: string[];
  /** accuracy (0-1) per node, computed only from the recent window, so it
   * naturally forgets old performance rather than needing a separate
   * decay/reset mechanism. */
  recentAccuracyByNode: Map<string, number>;
};

/**
 * One bounded, indexed query (userId + createdAt) instead of a second
 * table just for repeat-avoidance — PracticeAttempt already has everything
 * this needs.
 */
export async function getRecentPracticeHistory(userId: string): Promise<RecentPracticeHistory> {
  const attempts = await db.practiceAttempt.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: RECENT_WINDOW,
    select: { nodeId: true, correct: true },
  });

  const recentlySeenNodeIds = [...new Set(attempts.map((a) => a.nodeId))];

  const byNode = new Map<string, { correct: number; total: number }>();
  for (const a of attempts) {
    const stats = byNode.get(a.nodeId) ?? { correct: 0, total: 0 };
    stats.total += 1;
    if (a.correct) stats.correct += 1;
    byNode.set(a.nodeId, stats);
  }
  const recentAccuracyByNode = new Map(
    [...byNode.entries()].map(([nodeId, s]) => [nodeId, s.correct / s.total]),
  );

  return { recentlySeenNodeIds, recentAccuracyByNode };
}
