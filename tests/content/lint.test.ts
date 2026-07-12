import { describe, it, expect } from "vitest";
import { lintLevelContent } from "@/lib/content/lint";
import type { LevelContentInput } from "@/lib/validation/content";

const speakingData = {
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

const NON_MIC = [
  "TYPE_PINYIN",
  "TYPE_ENGLISH_GUIDED",
  "WORD_TILE_SELECT",
  "SENTENCE_REORDER",
  "DIALOGUE_CHOICE",
  "SHADOW_LISTEN",
  "AI_TEXT_CHAT",
] as const;

function baseExercises(order = 0) {
  return [
    {
      type: "MULTIPLE_CHOICE" as const,
      order,
      prompt: "Choose",
      supportedModes: ["TYPE_PINYIN"] as const,
      data: {
        options: [
          { text: "hello", isCorrect: true },
          { text: "goodbye", isCorrect: false },
        ],
      },
    },
    {
      type: "SPEAKING" as const,
      order: order + 1,
      prompt: "Speak",
      supportedModes: [...NON_MIC],
      data: speakingData,
    },
  ];
}

function makeLesson(overrides: Partial<{
  index: number;
  title: string;
  situationTag: string;
  grammarCode: string;
  vocab: { script: string; romanization: string; english: string }[];
  dialogueScripts: string[];
}>) {
  const vocab = overrides.vocab ?? [
    { script: "你好", romanization: "nǐ hǎo", english: "hello" },
    { script: "谢谢", romanization: "xièxiè", english: "thank you" },
    { script: "再见", romanization: "zàijiàn", english: "goodbye" },
    { script: "朋友", romanization: "péngyǒu", english: "friend" },
    { script: "老师", romanization: "lǎoshī", english: "teacher" },
    { script: "学生", romanization: "xuéshēng", english: "student" },
  ];
  return {
    index: overrides.index ?? 1,
    title: overrides.title ?? "Lesson",
    situationTag: overrides.situationTag ?? "greeting",
    estimatedMinutes: 18,
    isPublished: true,
    grammar: {
      code: overrides.grammarCode ?? "grammar-1",
      title: "Grammar",
      simpleExplanation: "Explanation.",
      visualExamples: [
        { script: "你好", romanization: "nǐ hǎo", english: "hello" },
        { script: "谢谢", romanization: "xièxiè", english: "thank you" },
      ],
      difficulty: 1,
      quiz: [{ prompt: "Q?", options: ["A", "B"], correctIndex: 0 }],
    },
    vocabulary: vocab,
    dialogue: {
      title: "Dialogue",
      situationTag: "greeting",
      lines: (overrides.dialogueScripts ?? ["你好", "谢谢"]).map((script, i) => ({
        speaker: i % 2 === 0 ? "A" : "B",
        script,
        romanization: "placeholder",
        english: "placeholder",
      })),
    },
    exercises: baseExercises(),
  };
}

function makeLevel(lessons: ReturnType<typeof makeLesson>[]): LevelContentInput {
  return {
    index: 3,
    title: "Test Level",
    description: "A level for testing.",
    modules: [
      {
        index: 1,
        key: "test-module",
        title: "Test Module",
        description: "A module for testing.",
        lessons,
      },
    ],
  } as LevelContentInput;
}

describe("lintLevelContent", () => {
  it("flags a MULTIPLE_CHOICE exercise with zero correct options as an ERROR", async () => {
    const lesson = makeLesson({});
    lesson.exercises = [
      {
        type: "MULTIPLE_CHOICE",
        order: 0,
        prompt: "Choose",
        supportedModes: ["TYPE_PINYIN"],
        data: {
          options: [
            { text: "hello", isCorrect: false },
            { text: "goodbye", isCorrect: false },
          ],
        },
      },
    ];
    const findings = await lintLevelContent(makeLevel([lesson]), "test-lang-lint-1");
    expect(findings.some((f) => f.code === "MISSING_ANSWER_KEY" && f.severity === "ERROR")).toBe(
      true,
    );
  });

  it("flags a MULTIPLE_CHOICE exercise with two correct options as an ERROR", async () => {
    const lesson = makeLesson({});
    lesson.exercises = [
      {
        type: "MULTIPLE_CHOICE",
        order: 0,
        prompt: "Choose",
        supportedModes: ["TYPE_PINYIN"],
        data: {
          options: [
            { text: "hello", isCorrect: true },
            { text: "goodbye", isCorrect: true },
          ],
        },
      },
    ];
    const findings = await lintLevelContent(makeLevel([lesson]), "test-lang-lint-2");
    expect(
      findings.some((f) => f.code === "AMBIGUOUS_ANSWER_KEY" && f.severity === "ERROR"),
    ).toBe(true);
  });

  it("does not flag a well-formed MULTIPLE_CHOICE exercise", async () => {
    const lesson = makeLesson({});
    const findings = await lintLevelContent(makeLevel([lesson]), "test-lang-lint-3");
    expect(findings.some((f) => f.code === "MISSING_ANSWER_KEY")).toBe(false);
    expect(findings.some((f) => f.code === "AMBIGUOUS_ANSWER_KEY")).toBe(false);
  });

  it("flags duplicate lesson titles within the same import as a WARNING", async () => {
    const lessons = [
      makeLesson({ index: 1, title: "Same Title", situationTag: "a", grammarCode: "g1" }),
      makeLesson({ index: 2, title: "Same Title", situationTag: "b", grammarCode: "g2" }),
    ];
    const findings = await lintLevelContent(makeLevel(lessons), "test-lang-lint-4");
    expect(
      findings.some((f) => f.code === "DUPLICATE_LESSON_TITLE" && f.severity === "WARNING"),
    ).toBe(true);
  });

  it("flags a word introduced once and never reused as INFO", async () => {
    const lesson = makeLesson({
      vocab: [
        { script: "你好", romanization: "nǐ hǎo", english: "hello" },
        { script: "谢谢", romanization: "xièxiè", english: "thank you" },
        { script: "再见", romanization: "zàijiàn", english: "goodbye" },
        { script: "朋友", romanization: "péngyǒu", english: "friend" },
        { script: "老师", romanization: "lǎoshī", english: "teacher" },
        { script: "独特词", romanization: "dútècí", english: "unique word" },
      ],
      dialogueScripts: ["你好", "谢谢"],
    });
    const findings = await lintLevelContent(makeLevel([lesson]), "test-lang-lint-5");
    expect(
      findings.some(
        (f) => f.code === "VOCAB_NEVER_REUSED" && f.message.includes("独特词"),
      ),
    ).toBe(true);
  });

  it("does not flag a word that reappears in a later lesson's dialogue", async () => {
    const lessons = [
      makeLesson({
        index: 1,
        title: "Lesson One",
        situationTag: "a",
        grammarCode: "g1",
      }),
      makeLesson({
        index: 2,
        title: "Lesson Two",
        situationTag: "b",
        grammarCode: "g2",
        dialogueScripts: ["你好朋友"], // reuses 你好 and 朋友 from lesson one
      }),
    ];
    const findings = await lintLevelContent(makeLevel(lessons), "test-lang-lint-6");
    const neverReusedWords = findings
      .filter((f) => f.code === "VOCAB_NEVER_REUSED")
      .map((f) => f.message);
    expect(neverReusedWords.some((m) => m.includes('"你好"'))).toBe(false);
  });

  it("flags identical exercise-type sequences across every lesson as RIGID_EXERCISE_TEMPLATE", async () => {
    const lessons = [
      makeLesson({ index: 1, title: "L1", situationTag: "a", grammarCode: "g1" }),
      makeLesson({ index: 2, title: "L2", situationTag: "b", grammarCode: "g2" }),
      makeLesson({ index: 3, title: "L3", situationTag: "c", grammarCode: "g3" }),
    ];
    const findings = await lintLevelContent(makeLevel(lessons), "test-lang-lint-7");
    expect(findings.some((f) => f.code === "RIGID_EXERCISE_TEMPLATE")).toBe(true);
  });
});
