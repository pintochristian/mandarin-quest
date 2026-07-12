import { describe, it, expect } from "vitest";
import {
  synthesizeVocabQuestion,
  synthesizeGrammarQuestion,
  type PracticeNode,
} from "@/lib/practice/synthesize";

function vocabNode(id: string, script: string, romanization: string, english: string): PracticeNode {
  return { id, type: "VOCAB", title: script, data: { script, romanization, english } };
}

const POOL: PracticeNode[] = [
  vocabNode("v1", "你好", "nǐ hǎo", "hello"),
  vocabNode("v2", "谢谢", "xièxiè", "thank you"),
  vocabNode("v3", "再见", "zàijiàn", "goodbye"),
  vocabNode("v4", "朋友", "péngyǒu", "friend"),
  vocabNode("v5", "老师", "lǎoshī", "teacher"),
];

describe("synthesizeVocabQuestion", () => {
  it("builds a MULTIPLE_CHOICE question for CN_RECOGNITION with exactly one correct option", () => {
    const target = POOL[0];
    const q = synthesizeVocabQuestion(target, "CN_RECOGNITION", POOL, "seed-1");
    expect(q).not.toBeNull();
    expect(q!.exerciseRecord.type).toBe("MULTIPLE_CHOICE");
    expect(q!.nodeId).toBe(target.id);
    const options = (q!.exerciseRecord.data as { options: { text: string; isCorrect: boolean }[] })
      .options;
    const correct = options.filter((o) => o.isCorrect);
    expect(correct).toHaveLength(1);
    expect(correct[0].text).toBe("hello");
  });

  it("never includes the target word's own answer among the distractors", () => {
    const target = POOL[0];
    const q = synthesizeVocabQuestion(target, "CN_RECOGNITION", POOL, "seed-2");
    const options = (q!.exerciseRecord.data as { options: { text: string; isCorrect: boolean }[] })
      .options;
    const wrongOptions = options.filter((o) => !o.isCorrect);
    expect(wrongOptions.every((o) => o.text !== "hello")).toBe(true);
  });

  it("draws distractors only from the provided pool, never introducing unknown words", () => {
    const target = POOL[0];
    const q = synthesizeVocabQuestion(target, "EN_RECALL", POOL, "seed-3");
    const options = (
      q!.exerciseRecord.data as { options: { text: string; isCorrect: boolean }[] }
    ).options;
    const poolScripts = new Set(POOL.map((n) => (n.data as { script: string }).script));
    expect(options.every((o) => poolScripts.has(o.text))).toBe(true);
  });

  it("is deterministic for the same seed", () => {
    const target = POOL[0];
    const a = synthesizeVocabQuestion(target, "CN_RECOGNITION", POOL, "same-seed");
    const b = synthesizeVocabQuestion(target, "CN_RECOGNITION", POOL, "same-seed");
    expect(a).toEqual(b);
  });

  it("returns null when the pool has too few other words to build fair distractors", () => {
    const target = POOL[0];
    const q = synthesizeVocabQuestion(target, "CN_RECOGNITION", [POOL[0], POOL[1]], "seed-4");
    expect(q).toBeNull();
  });
});

describe("synthesizeGrammarQuestion", () => {
  const grammarNode: PracticeNode = {
    id: "g1",
    type: "GRAMMAR",
    title: "可以",
    data: {
      simpleExplanation: "可以 means 'can/may'.",
      visualExamples: [
        { script: "我可以走吗？", romanization: "Wǒ kěyǐ zǒu ma?", english: "May I go?" },
        { script: "你可以坐这儿。", romanization: "Nǐ kěyǐ zuò zhèr.", english: "You may sit here." },
      ],
      quiz: [
        { prompt: "How do you ask permission?", options: ["可以", "谢谢", "再见"], correctIndex: 0 },
      ],
    },
  };

  it("reuses the authored quiz item as a MULTIPLE_CHOICE question with the right answer marked", () => {
    const q = synthesizeGrammarQuestion(grammarNode, "seed-5");
    expect(q).not.toBeNull();
    expect(q!.mode).toBe("GRAMMAR_QUIZ");
    expect(q!.nodeId).toBe("g1");
    const options = (q!.exerciseRecord.data as { options: { text: string; isCorrect: boolean }[] })
      .options;
    const correct = options.filter((o) => o.isCorrect);
    expect(correct).toHaveLength(1);
    expect(correct[0].text).toBe("可以");
  });

  it("returns null for a grammar node with no authored quiz", () => {
    const noQuiz: PracticeNode = {
      ...grammarNode,
      data: { ...(grammarNode.data as Record<string, unknown>), quiz: [] },
    };
    expect(synthesizeGrammarQuestion(noQuiz, "seed-6")).toBeNull();
  });
});
