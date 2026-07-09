import { db } from "@/lib/db";
import type { LevelContentInput, LevelOutlineInput } from "@/lib/validation/content";
import type { GrammarNodeData, VocabNodeData } from "@/lib/validation/knowledge";

/**
 * Reconstructs a level back into the exact JSON shape the import pipeline
 * accepts (lib/validation/content.ts schemas) — proves the round trip: what
 * comes out of export can be fed straight back into import.
 */
export async function exportLevel(
  levelId: string,
): Promise<LevelContentInput | LevelOutlineInput> {
  const level = await db.level.findUniqueOrThrow({
    where: { id: levelId },
    include: {
      modules: {
        orderBy: { index: "asc" },
        include: {
          lessons: {
            orderBy: { index: "asc" },
            include: {
              lessonNodes: {
                orderBy: { order: "asc" },
                include: { node: true },
              },
              dialogues: { include: { lines: { orderBy: { order: "asc" } } } },
              exercises: { orderBy: { order: "asc" } },
            },
          },
        },
      },
    },
  });

  const isOutline = level.modules.every((m) =>
    m.lessons.every((l) => l.outline !== null || l.lessonNodes.length === 0),
  );

  if (isOutline) {
    return {
      index: level.index,
      title: level.title,
      description: level.description,
      themeColor: level.themeColor ?? undefined,
      modules: level.modules.map((mod) => ({
        index: mod.index,
        key: mod.key,
        title: mod.title,
        description: mod.description,
        worldIcon: mod.worldIcon ?? undefined,
        worldTheme: mod.worldTheme ?? undefined,
        lessons: mod.lessons.map((l) => {
          const outline = l.outline as {
            grammarGoal: string;
            vocabularyGoal: string;
            conversationGoal: string;
          } | null;
          return {
            index: l.index,
            title: l.title,
            situationTag: l.situationTag,
            grammarGoal: outline?.grammarGoal ?? "",
            vocabularyGoal: outline?.vocabularyGoal ?? "",
            conversationGoal: outline?.conversationGoal ?? "",
          };
        }),
      })),
    };
  }

  return {
    index: level.index,
    title: level.title,
    description: level.description,
    themeColor: level.themeColor ?? undefined,
    modules: level.modules.map((mod) => ({
      index: mod.index,
      key: mod.key,
      title: mod.title,
      description: mod.description,
      worldIcon: mod.worldIcon ?? undefined,
      worldTheme: mod.worldTheme ?? undefined,
      lessons: mod.lessons.map((l) => {
        const grammarLink = l.lessonNodes.find((ln) => ln.node.type === "GRAMMAR");
        const vocabLinks = l.lessonNodes.filter((ln) => ln.node.type === "VOCAB");
        const goalLink = l.lessonNodes.find((ln) => ln.node.type === "CONVERSATION_GOAL");
        const grammarData = grammarLink!.node.data as unknown as GrammarNodeData;

        return {
          index: l.index,
          title: l.title,
          situationTag: l.situationTag,
          estimatedMinutes: l.estimatedMinutes,
          isPublished: l.isPublished,
          grammar: {
            code: grammarLink!.node.code,
            title: grammarLink!.node.title,
            simpleExplanation: grammarData.simpleExplanation,
            visualExamples: grammarData.visualExamples,
            difficulty: grammarLink!.node.difficulty,
            quiz: grammarData.quiz,
          },
          vocabulary: vocabLinks.map((ln) => {
            const data = ln.node.data as unknown as VocabNodeData;
            return {
              script: data.script,
              romanization: data.romanization,
              english: data.english,
              audioKey: data.audioKey ?? undefined,
              frequencyRank: data.frequencyRank ?? undefined,
              partOfSpeech: data.partOfSpeech ?? undefined,
            };
          }),
          dialogue: {
            title: l.dialogues[0]?.title ?? l.title,
            situationTag: l.dialogues[0]?.situationTag ?? l.situationTag,
            lines: (l.dialogues[0]?.lines ?? []).map((line) => ({
              speaker: line.speaker,
              script: line.script,
              romanization: line.romanization,
              english: line.english,
              audioKey: line.audioKey ?? undefined,
            })),
          },
          exercises: l.exercises.map((e) => ({
            type: e.type,
            order: e.order,
            prompt: e.prompt,
            data: e.data as never,
            supportedModes: e.supportedModes as never,
          })),
          conversationGoal: goalLink
            ? {
                code: goalLink.node.code,
                title: goalLink.node.title,
                description: goalLink.node.description,
              }
            : undefined,
        };
      }),
    })),
  };
}
