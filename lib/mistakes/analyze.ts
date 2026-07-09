import { db } from "@/lib/db";
import type { KnowledgeNodeType, MistakeType } from "@/lib/generated/prisma/enums";

export type RecurringMistakePattern = {
  mistakeType: MistakeType;
  count: number;
};

export type WeakNodeFromMistakes = {
  nodeId: string;
  title: string;
  type: KnowledgeNodeType;
  mistakeCount: number;
};

const RECURRING_THRESHOLD = 2;

/** Mistake types the learner hits often enough to be worth a targeted review session. */
export async function getRecurringMistakePatterns(
  userId: string,
): Promise<RecurringMistakePattern[]> {
  const grouped = await db.mistakeLog.groupBy({
    by: ["mistakeType"],
    where: { userId },
    _count: { mistakeType: true },
    orderBy: { _count: { mistakeType: "desc" } },
  });

  return grouped
    .map((g) => ({ mistakeType: g.mistakeType, count: g._count.mistakeType }))
    .filter((g) => g.count >= RECURRING_THRESHOLD);
}

/** Specific nodes tied to repeated mistakes — feeds weak-node weighting in lib/adaptive/recommend.ts. */
export async function getNodesWithRecurringMistakes(
  userId: string,
  limit = 5,
): Promise<WeakNodeFromMistakes[]> {
  const grouped = await db.mistakeLog.groupBy({
    by: ["nodeId"],
    where: { userId, nodeId: { not: null } },
    _count: { nodeId: true },
    orderBy: { _count: { nodeId: "desc" } },
    take: limit,
  });

  const nodeIds = grouped.map((g) => g.nodeId).filter((id): id is string => id !== null);
  const nodes = await db.knowledgeNode.findMany({
    where: { id: { in: nodeIds } },
    select: { id: true, title: true, type: true },
  });
  const nodeById = new Map(nodes.map((n) => [n.id, n]));

  return grouped
    .filter((g) => g.nodeId !== null && g._count.nodeId >= RECURRING_THRESHOLD)
    .map((g) => {
      const node = nodeById.get(g.nodeId as string);
      return {
        nodeId: g.nodeId as string,
        title: node?.title ?? "Unknown",
        type: node?.type ?? ("VOCAB" as KnowledgeNodeType),
        mistakeCount: g._count.nodeId,
      };
    });
}
