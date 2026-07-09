import { db } from "@/lib/db";
import { decayedMasteryScore } from "@/lib/srs/decay";
import { getNodesWithRecurringMistakes } from "@/lib/mistakes/analyze";
import type { KnowledgeNodeType } from "@/lib/generated/prisma/enums";

const WEAK_THRESHOLD = 0.4;
// A node with a recurring-mistake pattern is treated as this weak
// regardless of its SRS decay, so it still surfaces even if the learner
// happens to be reviewing it on schedule.
const MISTAKE_FLAGGED_SCORE = 0.1;

export type WeakNode = {
  id: string;
  title: string;
  type: KnowledgeNodeType;
  decayedScore: number;
};

/**
 * Nodes the learner has previously studied but whose retention has likely
 * decayed below a useful threshold, merged with nodes tied to a recurring
 * mistake pattern (lib/mistakes/analyze.ts) — the graph-aware signal that
 * feeds "review this before moving on" recommendations (lib/world-map.ts)
 * and the Review Health sub-score (lib/stats.ts).
 */
export async function getWeakNodes(userId: string, limit = 5): Promise<WeakNode[]> {
  const [masteries, mistakeNodes] = await Promise.all([
    db.userNodeMastery.findMany({
      // A node with no reviews yet has masteryScore 0 by default — that
      // means "not yet assessed," not "forgotten," so it's excluded here.
      // Only nodes that were actually reviewed at least once can be "weak."
      where: { userId, lastReviewedAt: { not: null } },
      select: {
        nodeId: true,
        masteryScore: true,
        intervalDays: true,
        nextReviewAt: true,
        node: { select: { title: true, type: true } },
      },
    }),
    getNodesWithRecurringMistakes(userId, limit),
  ]);

  const now = new Date();
  const byId = new Map<string, WeakNode>();

  for (const m of masteries) {
    const decayedScore = decayedMasteryScore(
      m.masteryScore,
      m.intervalDays,
      m.nextReviewAt,
      now,
    );
    if (decayedScore < WEAK_THRESHOLD) {
      byId.set(m.nodeId, {
        id: m.nodeId,
        title: m.node.title,
        type: m.node.type,
        decayedScore,
      });
    }
  }

  for (const m of mistakeNodes) {
    const existing = byId.get(m.nodeId);
    // A recurring mistake is at least as strong a signal as SRS decay —
    // never let it be masked by a still-healthy decayed score.
    if (!existing || existing.decayedScore > MISTAKE_FLAGGED_SCORE) {
      byId.set(m.nodeId, {
        id: m.nodeId,
        title: m.title,
        type: m.type,
        decayedScore: MISTAKE_FLAGGED_SCORE,
      });
    }
  }

  return Array.from(byId.values())
    .sort((a, b) => a.decayedScore - b.decayedScore)
    .slice(0, limit);
}

/** Plain-language summary of the weakest nodes, e.g. "measure words and 2 others". */
export function describeWeakNodes(nodes: WeakNode[]): string {
  if (nodes.length === 0) return "";
  if (nodes.length === 1) return nodes[0].title;
  const rest = nodes.length - 1;
  return `${nodes[0].title} and ${rest} other${rest === 1 ? "" : "s"}`;
}
