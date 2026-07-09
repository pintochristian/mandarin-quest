import type { InteractionMode, PracticeMode } from "@/lib/generated/prisma/enums";

/**
 * Picks which InteractionMode to render for a SPEAKING/CONVERSATION_SIM
 * exercise, given the learner's practiceMode setting and what the exercise
 * actually supports (see lib/validation/content.ts — every such exercise
 * supports every non-mic mode by construction, so this always resolves to
 * something even in Quiet mode).
 */
const PREFERENCE_BY_PRACTICE_MODE: Record<PracticeMode, InteractionMode[]> = {
  FULL_SPEAKING: [
    "MIC_SPEAKING",
    "SHADOW_LISTEN",
    "DIALOGUE_CHOICE",
    "TYPE_PINYIN",
    "WORD_TILE_SELECT",
    "SENTENCE_REORDER",
    "TYPE_ENGLISH_GUIDED",
    "AI_TEXT_CHAT",
  ],
  QUIET: [
    "TYPE_PINYIN",
    "WORD_TILE_SELECT",
    "SENTENCE_REORDER",
    "DIALOGUE_CHOICE",
    "SHADOW_LISTEN",
    "TYPE_ENGLISH_GUIDED",
    "AI_TEXT_CHAT",
  ],
  TYPING_ONLY: [
    "TYPE_PINYIN",
    "TYPE_ENGLISH_GUIDED",
    "WORD_TILE_SELECT",
    "SENTENCE_REORDER",
    "DIALOGUE_CHOICE",
    "SHADOW_LISTEN",
  ],
  LISTENING_ONLY: [
    "SHADOW_LISTEN",
    "DIALOGUE_CHOICE",
    "WORD_TILE_SELECT",
    "SENTENCE_REORDER",
    "TYPE_PINYIN",
    "TYPE_ENGLISH_GUIDED",
  ],
};

export function resolveInteractionMode(
  practiceMode: PracticeMode,
  supportedModes: InteractionMode[],
  micAvailable: boolean,
): InteractionMode {
  const preferences = PREFERENCE_BY_PRACTICE_MODE[practiceMode];
  for (const mode of preferences) {
    if (mode === "MIC_SPEAKING" && !micAvailable) continue;
    if (supportedModes.includes(mode)) return mode;
  }
  const fallback = supportedModes.find((m) => m !== "MIC_SPEAKING");
  return fallback ?? supportedModes[0];
}
