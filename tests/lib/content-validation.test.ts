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

describe("exerciseSchema — pinyin is never optional for authored Chinese text", () => {
  it("accepts FILL_BLANK data with romanization on the template and every choice", () => {
    const result = exerciseSchema.safeParse({
      type: "FILL_BLANK",
      order: 0,
      prompt: "Fill in the missing word.",
      supportedModes: ["TYPE_PINYIN", "WORD_TILE_SELECT"],
      data: {
        sentenceTemplate: "你___什么名字?",
        sentenceTemplateRomanization: "Nǐ ___ shénme míngzi?",
        correctAnswer: "叫",
        choices: [
          { text: "叫", romanization: "jiào" },
          { text: "是", romanization: "shì" },
        ],
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects FILL_BLANK data with plain-string choices (no romanization)", () => {
    const result = exerciseSchema.safeParse({
      type: "FILL_BLANK",
      order: 0,
      prompt: "Fill in the missing word.",
      supportedModes: ["TYPE_PINYIN", "WORD_TILE_SELECT"],
      data: {
        sentenceTemplate: "你___什么名字?",
        sentenceTemplateRomanization: "Nǐ ___ shénme míngzi?",
        correctAnswer: "叫",
        choices: ["叫", "是"],
      },
    });
    expect(result.success).toBe(false);
  });

  it("rejects FILL_BLANK data missing sentenceTemplateRomanization", () => {
    const result = exerciseSchema.safeParse({
      type: "FILL_BLANK",
      order: 0,
      prompt: "Fill in the missing word.",
      supportedModes: ["TYPE_PINYIN", "WORD_TILE_SELECT"],
      data: {
        sentenceTemplate: "你___什么名字?",
        correctAnswer: "叫",
        choices: [{ text: "叫", romanization: "jiào" }],
      },
    });
    expect(result.success).toBe(false);
  });

  it("accepts TRANSLATION data with correctAnswerRomanization for an en->zh answer", () => {
    const result = exerciseSchema.safeParse({
      type: "TRANSLATION",
      order: 0,
      prompt: "Translate into Mandarin.",
      supportedModes: ["TYPE_ENGLISH_GUIDED", "TYPE_PINYIN"],
      data: {
        sourceText: "What is your name?",
        sourceLang: "en",
        correctAnswer: "你叫什么名字?",
        correctAnswerRomanization: "Nǐ jiào shénme míngzi?",
        acceptableAnswers: ["你叫什么名字"],
      },
    });
    expect(result.success).toBe(true);
  });
});
