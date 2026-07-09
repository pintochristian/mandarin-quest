import { describe, it, expect } from "vitest";
import { exerciseSchema, NON_MIC_INTERACTION_MODES } from "@/lib/validation/content";

const validSpeakingData = {
  targetScript: "你好",
  targetRomanization: "nǐ hǎo",
  targetEnglish: "hello",
  tokens: ["你", "好"],
  distractorTokens: [],
  acceptablePinyin: ["ni hao"],
  englishPrompt: "Say hello.",
  dialogueChoiceOptions: [
    { script: "你好", romanization: "nǐ hǎo", english: "hello", isCorrect: true },
    { script: "再见", romanization: "zàijiàn", english: "goodbye", isCorrect: false },
  ],
  aiScenarioPrompt: "Greet the learner.",
};

describe("exerciseSchema — SPEAKING/CONVERSATION_SIM mode coverage", () => {
  it("accepts a SPEAKING exercise that supports every non-mic InteractionMode", () => {
    const result = exerciseSchema.safeParse({
      type: "SPEAKING",
      order: 0,
      prompt: "Say hello.",
      supportedModes: [...NON_MIC_INTERACTION_MODES, "MIC_SPEAKING"],
      data: validSpeakingData,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a SPEAKING exercise missing a non-mic InteractionMode", () => {
    const missingOne = NON_MIC_INTERACTION_MODES.filter((m) => m !== "SHADOW_LISTEN");
    const result = exerciseSchema.safeParse({
      type: "SPEAKING",
      order: 0,
      prompt: "Say hello.",
      supportedModes: missingOne,
      data: validSpeakingData,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a CONVERSATION_SIM exercise with only MIC_SPEAKING supported", () => {
    const result = exerciseSchema.safeParse({
      type: "CONVERSATION_SIM",
      order: 0,
      prompt: "Have a chat.",
      supportedModes: ["MIC_SPEAKING"],
      data: validSpeakingData,
    });
    expect(result.success).toBe(false);
  });

  it("rejects speaking data with more than one correct dialogue choice option", () => {
    const result = exerciseSchema.safeParse({
      type: "SPEAKING",
      order: 0,
      prompt: "Say hello.",
      supportedModes: [...NON_MIC_INTERACTION_MODES, "MIC_SPEAKING"],
      data: {
        ...validSpeakingData,
        dialogueChoiceOptions: [
          { script: "你好", romanization: "nǐ hǎo", english: "hello", isCorrect: true },
          { script: "再见", romanization: "zàijiàn", english: "goodbye", isCorrect: true },
        ],
      },
    });
    expect(result.success).toBe(false);
  });

  it("does not require full mode coverage for non-speaking exercise types", () => {
    const result = exerciseSchema.safeParse({
      type: "MULTIPLE_CHOICE",
      order: 0,
      prompt: "Pick one.",
      supportedModes: ["DIALOGUE_CHOICE"],
      data: {
        options: [
          { text: "Hello", isCorrect: true },
          { text: "Goodbye", isCorrect: false },
        ],
      },
    });
    expect(result.success).toBe(true);
  });
});
