import type { KnowledgeNodeType, ExerciseType } from "@/lib/generated/prisma/enums";
import type { GrammarNodeData, VocabNodeData } from "@/lib/validation/knowledge";
import type { LessonDetail } from "@/lib/types/lesson";

type RawLesson = {
  id: string;
  title: string;
  situationTag: string;
  estimatedMinutes: number;
  module: {
    id: string;
    title: string;
    level: { id: string; title: string; index: number };
  };
  lessonNodes: {
    order: number;
    node: {
      id: string;
      type: KnowledgeNodeType;
      title: string;
      data: unknown;
    };
  }[];
  dialogues: {
    id: string;
    title: string;
    lines: {
      order: number;
      speaker: string;
      script: string;
      romanization: string;
      english: string;
    }[];
  }[];
  exercises: {
    id: string;
    type: ExerciseType;
    order: number;
    prompt: string;
    data: unknown;
    supportedModes: unknown;
  }[];
};

/**
 * Reconstructs the lesson-runner's view model (LessonDetail) from a graph
 * query — `lessonNodes` partitioned by KnowledgeNode type instead of the old
 * direct `primaryGrammarConcept`/`lessonVocabulary` relations. Field names on
 * the returned object intentionally stay the same as before the graph
 * migration so GrammarStep/VocabularyStep/ReviewStep never had to change.
 */
export function mapLessonDetail(lesson: RawLesson): LessonDetail {
  const grammarLink = lesson.lessonNodes.find((ln) => ln.node.type === "GRAMMAR");
  const vocabLinks = lesson.lessonNodes
    .filter((ln) => ln.node.type === "VOCAB")
    .sort((a, b) => a.order - b.order);

  const primaryGrammarConcept = grammarLink
    ? (() => {
        const data = grammarLink.node.data as unknown as GrammarNodeData;
        return {
          id: grammarLink.node.id,
          title: grammarLink.node.title,
          simpleExplanation: data.simpleExplanation,
          visualExamples: data.visualExamples,
          quiz: data.quiz,
        };
      })()
    : null;

  const lessonVocabulary = vocabLinks.map((ln) => {
    const data = ln.node.data as unknown as VocabNodeData;
    return {
      order: ln.order,
      vocabularyItem: {
        id: ln.node.id,
        script: data.script,
        romanization: data.romanization,
        english: data.english,
        audioKey: data.audioKey ?? null,
      },
    };
  });

  return {
    id: lesson.id,
    title: lesson.title,
    situationTag: lesson.situationTag,
    estimatedMinutes: lesson.estimatedMinutes,
    module: lesson.module,
    primaryGrammarConcept,
    lessonVocabulary,
    dialogues: lesson.dialogues,
    exercises: lesson.exercises as LessonDetail["exercises"],
  };
}
