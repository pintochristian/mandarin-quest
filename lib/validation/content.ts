import { z } from "zod";
import { ExerciseType, InteractionMode } from "@/lib/generated/prisma/enums";

/**
 * Content-authoring schemas. Every lesson (whether hand-authored in
 * /content or imported as JSON through the admin panel) is validated
 * against these before it reaches the database, so bad content never
 * silently ships.
 */

const exerciseTypeValues = Object.values(ExerciseType) as [string, ...string[]];
const interactionModeValues = Object.values(InteractionMode) as [string, ...string[]];

export const interactionModeSchema = z.enum(interactionModeValues);
export const exerciseTypeSchema = z.enum(exerciseTypeValues);

// All modes a learner could use that don't require a live microphone.
export const NON_MIC_INTERACTION_MODES = interactionModeValues.filter(
  (m) => m !== "MIC_SPEAKING",
) as string[];

// ---------------------------------------------------------------------------
// Grammar
// ---------------------------------------------------------------------------

export const grammarExampleSchema = z.object({
  script: z.string().min(1),
  romanization: z.string().min(1),
  english: z.string().min(1),
  note: z.string().optional(),
});

export const grammarConceptSchema = z.object({
  code: z.string().min(1),
  title: z.string().min(1),
  simpleExplanation: z.string().min(1),
  visualExamples: z.array(grammarExampleSchema).min(2),
  difficulty: z.number().int().min(1).max(5).default(1),
  quiz: z
    .array(
      z.object({
        prompt: z.string().min(1),
        options: z.array(z.string().min(1)).min(2),
        correctIndex: z.number().int().min(0),
      }),
    )
    .min(1),
});

// ---------------------------------------------------------------------------
// Vocabulary
// ---------------------------------------------------------------------------

export const vocabularyItemSchema = z.object({
  script: z.string().min(1),
  romanization: z.string().min(1),
  english: z.string().min(1),
  audioKey: z.string().optional(),
  frequencyRank: z.number().int().positive().optional(),
  partOfSpeech: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Dialogue
// ---------------------------------------------------------------------------

export const dialogueLineSchema = z.object({
  speaker: z.string().min(1),
  script: z.string().min(1),
  romanization: z.string().min(1),
  english: z.string().min(1),
  audioKey: z.string().optional(),
});

export const dialogueSchema = z.object({
  title: z.string().min(1),
  situationTag: z.string().min(1),
  lines: z.array(dialogueLineSchema).min(2),
});

// ---------------------------------------------------------------------------
// Exercises
// ---------------------------------------------------------------------------

export const optionSchema = z.object({
  text: z.string().min(1),
  romanization: z.string().optional(),
  isCorrect: z.boolean(),
});

export const multipleChoiceDataSchema = z.object({
  questionScript: z.string().optional(),
  questionRomanization: z.string().optional(),
  questionEnglish: z.string().optional(),
  options: z.array(optionSchema).min(2),
});

export const listeningDataSchema = z.object({
  audioScript: z.string().min(1),
  audioRomanization: z.string().min(1),
  options: z.array(optionSchema).min(2),
});

export const sentenceOrderDataSchema = z.object({
  tokens: z.array(z.string().min(1)).min(2),
  englishHint: z.string().min(1),
});

export const fillBlankDataSchema = z.object({
  sentenceTemplate: z.string().min(1).includes("___"),
  correctAnswer: z.string().min(1),
  choices: z.array(z.string().min(1)).optional(),
});

export const translationDataSchema = z.object({
  sourceText: z.string().min(1),
  sourceLang: z.enum(["en", "zh"]),
  correctAnswer: z.string().min(1),
  acceptableAnswers: z.array(z.string().min(1)).default([]),
});

export const listeningComprehensionDataSchema = z.object({
  audioScript: z.string().min(1),
  audioRomanization: z.string().min(1),
  questionEnglish: z.string().min(1),
  options: z.array(optionSchema).min(2),
});

export const rapidReviewDataSchema = z.object({
  items: z
    .array(
      z.object({
        promptScript: z.string().min(1),
        promptRomanization: z.string().min(1),
        answerEnglish: z.string().min(1),
      }),
    )
    .min(3),
});

/**
 * SPEAKING / CONVERSATION_SIM exercises must carry enough data to render
 * every InteractionMode other than MIC_SPEAKING (which is optional by
 * definition — it's the only mode that requires a live microphone). This is
 * the schema-level guarantee that Quiet/Typing-only/Listening-only modes
 * always have a full replacement, never a dead end.
 */
export const speakingDataSchema = z.object({
  targetScript: z.string().min(1),
  targetRomanization: z.string().min(1),
  targetEnglish: z.string().min(1),
  // WORD_TILE_SELECT / SENTENCE_REORDER
  tokens: z.array(z.string().min(1)).min(2),
  distractorTokens: z.array(z.string().min(1)).default([]),
  // TYPE_PINYIN
  acceptablePinyin: z.array(z.string().min(1)).min(1),
  // TYPE_ENGLISH_GUIDED
  englishPrompt: z.string().min(1),
  // DIALOGUE_CHOICE
  dialogueChoiceOptions: z
    .array(
      z.object({
        script: z.string().min(1),
        romanization: z.string().min(1),
        english: z.string().min(1),
        isCorrect: z.boolean(),
      }),
    )
    .min(2)
    .refine((opts) => opts.filter((o) => o.isCorrect).length === 1, {
      message: "Exactly one dialogueChoiceOptions entry must be correct",
    }),
  // AI_TEXT_CHAT
  aiScenarioPrompt: z.string().min(1),
});

const exerciseBaseSchema = z.object({
  order: z.number().int().min(0),
  prompt: z.string().min(1),
  supportedModes: z.array(interactionModeSchema).min(1),
});

export const exerciseSchema = z
  .discriminatedUnion("type", [
    exerciseBaseSchema.extend({
      type: z.literal("MULTIPLE_CHOICE"),
      data: multipleChoiceDataSchema,
    }),
    exerciseBaseSchema.extend({
      type: z.literal("LISTENING"),
      data: listeningDataSchema,
    }),
    exerciseBaseSchema.extend({
      type: z.literal("SENTENCE_ORDER"),
      data: sentenceOrderDataSchema,
    }),
    exerciseBaseSchema.extend({
      type: z.literal("FILL_BLANK"),
      data: fillBlankDataSchema,
    }),
    exerciseBaseSchema.extend({
      type: z.literal("TRANSLATION"),
      data: translationDataSchema,
    }),
    exerciseBaseSchema.extend({
      type: z.literal("LISTENING_COMPREHENSION"),
      data: listeningComprehensionDataSchema,
    }),
    exerciseBaseSchema.extend({
      type: z.literal("SPEAKING"),
      data: speakingDataSchema,
    }),
    exerciseBaseSchema.extend({
      type: z.literal("CONVERSATION_SIM"),
      data: speakingDataSchema,
    }),
    exerciseBaseSchema.extend({
      type: z.literal("RAPID_REVIEW"),
      data: rapidReviewDataSchema,
    }),
  ])
  .superRefine((exercise, ctx) => {
    if (exercise.type === "SPEAKING" || exercise.type === "CONVERSATION_SIM") {
      const missing = NON_MIC_INTERACTION_MODES.filter(
        (mode) => !exercise.supportedModes.includes(mode as never),
      );
      if (missing.length > 0) {
        ctx.addIssue({
          code: "custom",
          message: `${exercise.type} exercises must support every non-mic InteractionMode. Missing: ${missing.join(", ")}`,
          path: ["supportedModes"],
        });
      }
    }
  });

export type ExerciseInput = z.infer<typeof exerciseSchema>;
export type MultipleChoiceData = z.infer<typeof multipleChoiceDataSchema>;
export type ListeningData = z.infer<typeof listeningDataSchema>;
export type SentenceOrderData = z.infer<typeof sentenceOrderDataSchema>;
export type FillBlankData = z.infer<typeof fillBlankDataSchema>;
export type TranslationData = z.infer<typeof translationDataSchema>;
export type ListeningComprehensionData = z.infer<typeof listeningComprehensionDataSchema>;
export type RapidReviewData = z.infer<typeof rapidReviewDataSchema>;
export type SpeakingData = z.infer<typeof speakingDataSchema>;
export type GrammarConceptInput = z.infer<typeof grammarConceptSchema>;
export type VocabularyItemInput = z.infer<typeof vocabularyItemSchema>;
export type DialogueInput = z.infer<typeof dialogueSchema>;

// ---------------------------------------------------------------------------
// Lesson (full authoring unit)
// ---------------------------------------------------------------------------

// A real-world milestone this lesson serves (e.g. "Order Coffee"). Optional
// and additive — surfaced as visible progression starting in Phase 15, but
// accepted by the import pipeline from Phase 10 onward so content authored
// now doesn't need re-authoring later.
export const conversationGoalSchema = z.object({
  code: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
});

export const lessonContentSchema = z.object({
  index: z.number().int().min(1),
  title: z.string().min(1),
  situationTag: z.string().min(1),
  estimatedMinutes: z.number().int().positive().default(18),
  isPublished: z.boolean().default(true),
  grammar: grammarConceptSchema,
  vocabulary: z.array(vocabularyItemSchema).min(6).max(12),
  dialogue: dialogueSchema,
  exercises: z.array(exerciseSchema).min(4),
  conversationGoal: conversationGoalSchema.optional(),
});

export type LessonContentInput = z.infer<typeof lessonContentSchema>;

export const moduleContentSchema = z.object({
  index: z.number().int().min(1),
  key: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  worldIcon: z.string().optional(),
  worldTheme: z.string().optional(),
  lessons: z.array(lessonContentSchema),
});

export type ModuleContentInput = z.infer<typeof moduleContentSchema>;

export const levelContentSchema = z.object({
  index: z.number().int().min(1).max(8),
  title: z.string().min(1),
  description: z.string().min(1),
  themeColor: z.string().optional(),
  modules: z.array(moduleContentSchema),
});

export type LevelContentInput = z.infer<typeof levelContentSchema>;

// Outline-only entries for levels not yet fully authored (Levels 3-8 in the
// initial build): objectives/grammar/vocab/conversation goals, no full
// lesson bodies yet. These seed as unpublished placeholders the admin panel
// can flesh out later without any code changes.
export const lessonOutlineSchema = z.object({
  index: z.number().int().min(1),
  title: z.string().min(1),
  situationTag: z.string().min(1),
  grammarGoal: z.string().min(1),
  vocabularyGoal: z.string().min(1),
  conversationGoal: z.string().min(1),
});

export const moduleOutlineSchema = z.object({
  index: z.number().int().min(1),
  key: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  worldIcon: z.string().optional(),
  worldTheme: z.string().optional(),
  lessons: z.array(lessonOutlineSchema),
});

export const levelOutlineSchema = z.object({
  index: z.number().int().min(1).max(8),
  title: z.string().min(1),
  description: z.string().min(1),
  themeColor: z.string().optional(),
  modules: z.array(moduleOutlineSchema),
});

export type LevelOutlineInput = z.infer<typeof levelOutlineSchema>;
