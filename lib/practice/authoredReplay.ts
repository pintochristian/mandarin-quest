import { db } from "@/lib/db";
import { createRng, seededSample } from "@/lib/practice/seededRandom";
import type { ExerciseQuestion } from "@/lib/practice/synthesize";
import type { ExerciseRecord } from "@/lib/types/lesson";
import type { InteractionMode } from "@/lib/generated/prisma/enums";

/**
 * Practice types #6/7/9/10 from the amendment (fill-in-the-blank, sentence
 * ordering, best dialogue response, rapid mixed review) are deliberately
 * NOT synthesized — a freely-generated fill-blank or word-order exercise
 * risks an ambiguous or multi-valid-answer question (uncertain
 * segmentation, weak distractors). Instead this replays real, human-
 * authored Exercise rows scoped to lessons that taught/reviewed something
 * in the current practice pool — content that already passed content
 * review once, reused rather than reinvented.
 */

/** Lessons that TEACH or REVIEW any node currently in the pool — the scope
 * authored exercises are drawn from, since Exercise.primaryNodeId only
 * ever points at a lesson's grammar node (not per-vocab), so filtering
 * Exercise by node id directly would miss almost everything. */
export async function getEligibleLessonIds(nodeIds: string[]): Promise<string[]> {
  if (nodeIds.length === 0) return [];
  const links = await db.lessonNode.findMany({
    where: { nodeId: { in: nodeIds } },
    select: { lessonId: true },
    distinct: ["lessonId"],
  });
  return links.map((l) => l.lessonId);
}

const DIRECT_REPLAY_TYPES = ["FILL_BLANK", "SENTENCE_ORDER", "RAPID_REVIEW"] as const;

export async function getAuthoredReplayQuestions(
  lessonIds: string[],
  seed: string,
  limit: number,
): Promise<ExerciseQuestion[]> {
  if (lessonIds.length === 0 || limit <= 0) return [];

  const exercises = await db.exercise.findMany({
    where: {
      lessonId: { in: lessonIds },
      type: { in: [...DIRECT_REPLAY_TYPES, "SPEAKING", "CONVERSATION_SIM"] },
    },
    select: {
      id: true,
      type: true,
      prompt: true,
      data: true,
      supportedModes: true,
      primaryNodeId: true,
    },
  });

  const candidates: ExerciseQuestion[] = [];
  for (const ex of exercises) {
    if (!ex.primaryNodeId) continue; // no node to attribute the PracticeAttempt to

    if (
      ex.type === "FILL_BLANK" ||
      ex.type === "SENTENCE_ORDER" ||
      ex.type === "RAPID_REVIEW"
    ) {
      candidates.push({
        kind: "exercise",
        nodeId: ex.primaryNodeId,
        mode: `AUTHORED_${ex.type}`,
        exerciseRecord: {
          id: `practice:authored:${ex.id}`,
          type: ex.type,
          order: 0,
          prompt: ex.prompt,
          supportedModes: ex.supportedModes as InteractionMode[],
          data: ex.data,
        } as ExerciseRecord,
      });
      continue;
    }

    // SPEAKING / CONVERSATION_SIM: only reuse the DIALOGUE_CHOICE mode
    // (type #9, "best dialogue response") — force that single mode via
    // supportedModes so resolveInteractionMode can't pick anything else.
    const modes = ex.supportedModes as InteractionMode[];
    if (modes.includes("DIALOGUE_CHOICE")) {
      candidates.push({
        kind: "exercise",
        nodeId: ex.primaryNodeId,
        mode: "AUTHORED_DIALOGUE_CHOICE",
        exerciseRecord: {
          id: `practice:authored:${ex.id}:dialogue`,
          type: ex.type,
          order: 0,
          prompt: ex.prompt,
          supportedModes: ["DIALOGUE_CHOICE"],
          data: ex.data,
        } as ExerciseRecord,
      });
    }
  }

  return seededSample(candidates, limit, createRng(seed));
}
