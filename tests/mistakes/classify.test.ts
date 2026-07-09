import { describe, it, expect } from "vitest";
import { classifyStructuredMistake } from "@/lib/mistakes/classify";

describe("classifyStructuredMistake", () => {
  it("classifies SENTENCE_ORDER as WRONG_WORD_ORDER when the same tokens are out of order", () => {
    const result = classifyStructuredMistake({
      kind: "SENTENCE_ORDER",
      submitted: ["你", "好", "吗"],
      correct: ["你", "吗", "好"],
    });
    expect(result).toBe("WRONG_WORD_ORDER");
  });

  it("classifies SENTENCE_ORDER as WRONG_VOCAB when the token set itself is wrong", () => {
    const result = classifyStructuredMistake({
      kind: "SENTENCE_ORDER",
      submitted: ["你", "好"],
      correct: ["你", "们"],
    });
    expect(result).toBe("WRONG_VOCAB");
  });

  it("classifies FILL_BLANK correct answers containing a measure word as WRONG_MEASURE_WORD", () => {
    const result = classifyStructuredMistake({
      kind: "FILL_BLANK",
      selected: "一杯水",
      correct: "一个人",
    });
    expect(result).toBe("WRONG_MEASURE_WORD");
  });

  it("classifies MULTIPLE_CHOICE correct answers containing a particle as WRONG_PARTICLE", () => {
    const result = classifyStructuredMistake({
      kind: "MULTIPLE_CHOICE",
      selectedText: "我是学生",
      correctText: "我是学生吗",
    });
    expect(result).toBe("WRONG_PARTICLE");
  });

  it("falls back to WRONG_VOCAB when no known measure word or particle is present", () => {
    const result = classifyStructuredMistake({
      kind: "LISTENING",
      selectedText: "谢谢",
      correctText: "再见",
    });
    expect(result).toBe("WRONG_VOCAB");
  });
});
