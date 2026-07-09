import type { MistakeType } from "@/lib/generated/prisma/enums";

/**
 * Simple deterministic classification for structured exercise types (the
 * correct answer is a known, finite value, so no AI call is needed). This
 * is a real but intentionally simple heuristic — it inspects the correct
 * answer's characters against small closed sets of common Mandarin measure
 * words and particles, rather than claiming full linguistic analysis.
 */

const MEASURE_WORDS = new Set([
  "个",
  "位",
  "只",
  "本",
  "张",
  "条",
  "杯",
  "碗",
  "件",
  "辆",
  "支",
  "把",
  "双",
  "块",
  "家",
  "间",
  "次",
  "些",
]);

const PARTICLES = new Set(["了", "的", "吗", "呢", "着", "过", "地", "得", "吧", "啊"]);

function classifyPhrase(text: string): MistakeType {
  const chars = [...text];
  if (chars.some((c) => MEASURE_WORDS.has(c))) return "WRONG_MEASURE_WORD";
  if (chars.some((c) => PARTICLES.has(c))) return "WRONG_PARTICLE";
  return "WRONG_VOCAB";
}

function sameMultiset(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sort = (arr: string[]) => [...arr].sort();
  const as = sort(a);
  const bs = sort(b);
  return as.every((v, i) => v === bs[i]);
}

export type StructuredMistakeInput =
  | { kind: "MULTIPLE_CHOICE" | "LISTENING" | "DIALOGUE_CHOICE"; selectedText: string; correctText: string }
  | { kind: "FILL_BLANK"; selected: string; correct: string }
  | { kind: "SENTENCE_ORDER"; submitted: string[]; correct: string[] };

export function classifyStructuredMistake(input: StructuredMistakeInput): MistakeType {
  switch (input.kind) {
    case "SENTENCE_ORDER":
      // Right words, wrong order vs. an outright wrong word choice.
      return sameMultiset(input.submitted, input.correct)
        ? "WRONG_WORD_ORDER"
        : "WRONG_VOCAB";
    case "FILL_BLANK":
      return classifyPhrase(input.correct);
    case "MULTIPLE_CHOICE":
    case "LISTENING":
    case "DIALOGUE_CHOICE":
      return classifyPhrase(input.correctText);
  }
}
