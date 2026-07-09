import type { ExerciseType, InteractionMode } from "@/lib/generated/prisma/enums";
import type {
  MultipleChoiceData,
  ListeningData,
  SentenceOrderData,
  FillBlankData,
  TranslationData,
  ListeningComprehensionData,
  RapidReviewData,
  SpeakingData,
} from "@/lib/validation/content";

export type ExerciseRecord =
  | {
      id: string;
      type: "MULTIPLE_CHOICE";
      order: number;
      prompt: string;
      supportedModes: InteractionMode[];
      data: MultipleChoiceData;
    }
  | {
      id: string;
      type: "LISTENING";
      order: number;
      prompt: string;
      supportedModes: InteractionMode[];
      data: ListeningData;
    }
  | {
      id: string;
      type: "SENTENCE_ORDER";
      order: number;
      prompt: string;
      supportedModes: InteractionMode[];
      data: SentenceOrderData;
    }
  | {
      id: string;
      type: "FILL_BLANK";
      order: number;
      prompt: string;
      supportedModes: InteractionMode[];
      data: FillBlankData;
    }
  | {
      id: string;
      type: "TRANSLATION";
      order: number;
      prompt: string;
      supportedModes: InteractionMode[];
      data: TranslationData;
    }
  | {
      id: string;
      type: "LISTENING_COMPREHENSION";
      order: number;
      prompt: string;
      supportedModes: InteractionMode[];
      data: ListeningComprehensionData;
    }
  | {
      id: string;
      type: "SPEAKING";
      order: number;
      prompt: string;
      supportedModes: InteractionMode[];
      data: SpeakingData;
    }
  | {
      id: string;
      type: "CONVERSATION_SIM";
      order: number;
      prompt: string;
      supportedModes: InteractionMode[];
      data: SpeakingData;
    }
  | {
      id: string;
      type: "RAPID_REVIEW";
      order: number;
      prompt: string;
      supportedModes: InteractionMode[];
      data: RapidReviewData;
    };

export type LessonDetail = {
  id: string;
  title: string;
  situationTag: string;
  estimatedMinutes: number;
  module: {
    id: string;
    title: string;
    level: { id: string; title: string; index: number };
  };
  primaryGrammarConcept: {
    id: string;
    title: string;
    simpleExplanation: string;
    visualExamples: {
      script: string;
      romanization: string;
      english: string;
      note?: string;
    }[];
    quiz?: { prompt: string; options: string[]; correctIndex: number }[];
  } | null;
  lessonVocabulary: {
    order: number;
    vocabularyItem: {
      id: string;
      script: string;
      romanization: string;
      english: string;
      audioKey: string | null;
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

// Grammar's visualExamples/quiz and Exercise.data/supportedModes come back
// from the API as `unknown` JSON — this cast is safe because both were
// validated by lib/validation/content.ts before ever reaching the database
// (at seed time, or at admin-import time in Phase 7).
export function asExerciseRecords(lesson: LessonDetail): ExerciseRecord[] {
  return lesson.exercises.map(
    (e) =>
      ({
        id: e.id,
        type: e.type,
        order: e.order,
        prompt: e.prompt,
        supportedModes: e.supportedModes as InteractionMode[],
        data: e.data,
      }) as ExerciseRecord,
  );
}
