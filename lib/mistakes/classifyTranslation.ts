import { getTutorReply } from "@/lib/ai-tutor/client";
import type { MistakeType } from "@/lib/generated/prisma/enums";

const VALID_TYPES: MistakeType[] = [
  "WRONG_GRAMMAR",
  "WRONG_WORD_ORDER",
  "WRONG_VOCAB",
  "WRONG_TONE",
  "WRONG_PARTICLE",
  "ENGLISH_STRUCTURE",
  "WRONG_MEASURE_WORD",
  "OTHER",
];

/**
 * Free-text TRANSLATION answers can't be classified with a lookup table —
 * this is the one lightweight Claude call the mistake pipeline makes,
 * reusing the same client as the AI tutor. Falls back to OTHER if the API
 * key isn't configured or the call fails, so mistake logging never blocks
 * on AI availability.
 */
export async function classifyTranslationMistake(input: {
  promptText: string;
  submittedText: string;
  correctText: string;
  sourceLang: "en" | "zh";
}): Promise<MistakeType> {
  const system = `You classify a Mandarin learner's incorrect translation attempt into exactly one category. Reply with ONLY the category name, nothing else. Categories: ${VALID_TYPES.join(", ")}.`;
  const userMessage = [
    `Prompt (${input.sourceLang === "en" ? "English to translate" : "Mandarin to translate"}): "${input.promptText}"`,
    `Correct answer: "${input.correctText}"`,
    `Learner wrote: "${input.submittedText}"`,
    "Which single category best explains the mistake?",
  ].join("\n");

  try {
    const reply = await getTutorReply(system, [{ role: "user", content: userMessage }]);
    const cleaned = reply.trim().toUpperCase().replace(/[^A-Z_]/g, "");
    return (VALID_TYPES as string[]).includes(cleaned) ? (cleaned as MistakeType) : "OTHER";
  } catch {
    return "OTHER";
  }
}
