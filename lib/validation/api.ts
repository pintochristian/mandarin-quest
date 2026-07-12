import { z } from "zod";

export const onboardingSchema = z.object({
  practiceMode: z.enum(["FULL_SPEAKING", "QUIET", "TYPING_ONLY", "LISTENING_ONLY"]),
});

export const completeLessonSchema = z.object({
  score: z.number().int().min(0).max(100),
});

export const aiTutorChatSchema = z.object({
  sessionId: z.string().min(1).nullish(),
  lessonId: z.string().min(1).nullish(),
  message: z.string().min(1).max(1000),
});

export const submitReviewSchema = z.object({
  reviewItemId: z.string().min(1),
  quality: z.number().int().min(0).max(5),
  responseTimeMs: z.number().int().positive().optional(),
});

export const speechScoreSchema = z.object({
  exerciseId: z.string().min(1),
  transcript: z.string().min(1),
  targetText: z.string().min(1),
  accuracyScore: z.number().min(0).max(1),
  toneScore: z.number().min(0).max(1),
});

export const logMistakeSchema = z.object({
  exerciseId: z.string().min(1),
  input: z.discriminatedUnion("kind", [
    z.object({
      kind: z.enum(["MULTIPLE_CHOICE", "LISTENING", "DIALOGUE_CHOICE"]),
      selectedText: z.string().min(1),
      correctText: z.string().min(1),
    }),
    z.object({
      kind: z.literal("FILL_BLANK"),
      selected: z.string().min(1),
      correct: z.string().min(1),
    }),
    z.object({
      kind: z.literal("SENTENCE_ORDER"),
      submitted: z.array(z.string()).min(1),
      correct: z.array(z.string()).min(1),
    }),
    z.object({
      kind: z.literal("TRANSLATION"),
      promptText: z.string().min(1),
      submittedText: z.string().min(1),
      correctText: z.string().min(1),
      sourceLang: z.enum(["en", "zh"]),
    }),
  ]),
});

export const updateSettingsSchema = z.object({
  practiceMode: z
    .enum(["FULL_SPEAKING", "QUIET", "TYPING_ONLY", "LISTENING_ONLY"])
    .optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  audioSpeed: z.number().min(0.5).max(2).optional(),
  showPinyin: z.boolean().optional(),
  showEnglish: z.boolean().optional(),
  speakingSensitivity: z.number().min(0).max(1).optional(),
  aiEnabled: z.boolean().optional(),
});

export const practiceSourceSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("ALL") }),
  z.object({ kind: z.literal("WEAK") }),
  z.object({ kind: z.literal("RECENT") }),
  z.object({ kind: z.literal("MASTERED") }),
  z.object({ kind: z.literal("MISTAKES") }),
  z.object({ kind: z.literal("LESSON"), lessonId: z.string().min(1) }),
  z.object({ kind: z.literal("MODULE"), moduleId: z.string().min(1) }),
  z.object({ kind: z.literal("LEVEL"), levelIndex: z.number().int().min(1) }),
  z.object({ kind: z.literal("CUSTOM"), nodeIds: z.array(z.string().min(1)).min(1) }),
]);

export const startPracticeSessionSchema = z.object({
  source: practiceSourceSchema,
  length: z.number().int().min(1).max(50),
});

export const logPracticeAttemptSchema = z.object({
  sessionId: z.string().min(1),
  nodeId: z.string().min(1),
  mode: z.string().min(1),
  correct: z.boolean(),
  responseTimeMs: z.number().int().positive().optional(),
});
