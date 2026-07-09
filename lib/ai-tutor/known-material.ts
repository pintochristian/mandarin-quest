import { db } from "@/lib/db";
import type { GrammarNodeData, VocabNodeData } from "@/lib/validation/knowledge";

export type KnownMaterial = {
  vocab: { script: string; romanization: string; english: string }[];
  grammar: { title: string; simpleExplanation: string }[];
};

/**
 * What the learner has actually studied: the vocabulary and grammar nodes
 * from every lesson they've completed. This is the hard ceiling the AI
 * tutor's system prompt enforces — it must never speak using vocabulary or
 * grammar outside this set.
 */
export async function getKnownMaterial(userId: string): Promise<KnownMaterial> {
  const completed = await db.userLessonProgress.findMany({
    where: { userId, status: "COMPLETED" },
    select: {
      lesson: {
        select: {
          lessonNodes: {
            select: { node: true },
          },
        },
      },
    },
  });

  const vocabMap = new Map<
    string,
    { script: string; romanization: string; english: string }
  >();
  const grammarMap = new Map<string, { title: string; simpleExplanation: string }>();

  for (const { lesson } of completed) {
    for (const { node } of lesson.lessonNodes) {
      if (node.type === "VOCAB") {
        const data = node.data as unknown as VocabNodeData;
        vocabMap.set(data.script, {
          script: data.script,
          romanization: data.romanization,
          english: data.english,
        });
      } else if (node.type === "GRAMMAR") {
        const data = node.data as unknown as GrammarNodeData;
        grammarMap.set(node.title, {
          title: node.title,
          simpleExplanation: data.simpleExplanation,
        });
      }
    }
  }

  return {
    vocab: Array.from(vocabMap.values()),
    grammar: Array.from(grammarMap.values()),
  };
}

/**
 * Recent-performance signal used to adapt the tutor's register: average
 * SM-2 grading quality (0-5) across the learner's last N reviews. Below
 * threshold -> simplify further; above -> allow slightly more natural,
 * longer sentences.
 */
export async function getRecentPerformance(
  userId: string,
): Promise<"struggling" | "steady" | "succeeding"> {
  const recentLogs = await db.userNodeMasteryLog.findMany({
    where: { mastery: { userId } },
    orderBy: { reviewedAt: "desc" },
    take: 10,
    select: { quality: true },
  });

  if (recentLogs.length === 0) return "steady";

  const avg = recentLogs.reduce((sum, l) => sum + l.quality, 0) / recentLogs.length;
  if (avg < 2.5) return "struggling";
  if (avg >= 4) return "succeeding";
  return "steady";
}
