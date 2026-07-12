import { createRng, seededSample, seededShuffle } from "@/lib/practice/seededRandom";
import type { VocabNodeData, GrammarNodeData } from "@/lib/validation/knowledge";
import type { ExerciseRecord } from "@/lib/types/lesson";
import type { KnowledgeNodeType } from "@/lib/generated/prisma/enums";

export type PracticeNode = {
  id: string;
  type: KnowledgeNodeType;
  title: string;
  data: unknown;
};

/** One synthesized practice question — an ExerciseRecord (renderable by the
 * existing, unmodified ExerciseRenderer) plus the bookkeeping Practice
 * Anytime needs to log the attempt against the right node. */
export type PracticeQuestion = {
  exerciseRecord: ExerciseRecord;
  nodeId: string;
  mode: string;
};

export const VOCAB_FORMATS = ["CN_RECOGNITION", "EN_RECALL"] as const;
export type VocabFormat = (typeof VOCAB_FORMATS)[number];

const DISTRACTOR_COUNT = 3;

/**
 * Builds one multiple-choice-shaped practice question from a VOCAB node.
 * Distractors are drawn only from `distractorPool` — the caller passes the
 * learner's own eligible/known node pool, so a practice question never
 * introduces a word the learner hasn't already encountered (matches "never
 * unexpectedly introduce unknown vocabulary").
 */
export function synthesizeVocabQuestion(
  node: PracticeNode,
  format: VocabFormat,
  distractorPool: PracticeNode[],
  seed: string,
): PracticeQuestion | null {
  const data = node.data as VocabNodeData;
  if (!data?.script || !data?.english) return null;

  const rand = createRng(seed);
  const otherVocab = distractorPool.filter(
    (n) => n.id !== node.id && n.type === "VOCAB",
  );
  const distractors = seededSample(otherVocab, DISTRACTOR_COUNT, rand)
    .map((n) => n.data as VocabNodeData)
    .filter((d): d is VocabNodeData => Boolean(d?.script && d?.english));

  // Too few distinct words in the pool to build a fair multiple-choice
  // question — the caller should fall back to a different node/format.
  if (distractors.length < 2) return null;

  if (format === "CN_RECOGNITION") {
    const options = seededShuffle(
      [
        { text: data.english, isCorrect: true },
        ...distractors.map((d) => ({ text: d.english, isCorrect: false })),
      ],
      rand,
    );
    return {
      nodeId: node.id,
      mode: format,
      exerciseRecord: {
        id: `practice:${node.id}:${format}`,
        type: "MULTIPLE_CHOICE",
        order: 0,
        prompt: "What does this mean?",
        supportedModes: [],
        data: {
          questionScript: data.script,
          questionRomanization: data.romanization,
          options,
        },
      },
    };
  }

  // EN_RECALL
  const options = seededShuffle(
    [
      { text: data.script, romanization: data.romanization, isCorrect: true },
      ...distractors.map((d) => ({
        text: d.script,
        romanization: d.romanization,
        isCorrect: false,
      })),
    ],
    rand,
  );
  return {
    nodeId: node.id,
    mode: format,
    exerciseRecord: {
      id: `practice:${node.id}:${format}`,
      type: "MULTIPLE_CHOICE",
      order: 0,
      // MultipleChoiceExercise only ever renders data.questionScript, never
      // data.questionEnglish (that field is declared in the schema but
      // dead in every existing render path — LISTENING_COMPREHENSION drops
      // it too, see ExerciseRenderer's remap) — folding the target word
      // into the prompt itself instead of relying on it.
      prompt: `Which word means "${data.english}"?`,
      supportedModes: [],
      data: { options },
    },
  };
}

/**
 * Reuses a GRAMMAR node's own authored `quiz` array (already validated,
 * already used once inside GrammarStep) as free practice content — zero
 * new authoring required. Rotates through quiz items deterministically by
 * seed so repeated practice of the same grammar concept doesn't always
 * show the same question.
 */
export function synthesizeGrammarQuestion(
  node: PracticeNode,
  seed: string,
): PracticeQuestion | null {
  const data = node.data as GrammarNodeData;
  if (!data?.quiz || data.quiz.length === 0) return null;

  const rand = createRng(seed);
  const quizItem = data.quiz[Math.floor(rand() * data.quiz.length)];

  const options = quizItem.options.map((text, i) => ({
    text,
    isCorrect: i === quizItem.correctIndex,
  }));

  return {
    nodeId: node.id,
    mode: "GRAMMAR_QUIZ",
    exerciseRecord: {
      id: `practice:${node.id}:GRAMMAR_QUIZ:${quizItem.prompt}`,
      type: "MULTIPLE_CHOICE",
      order: 0,
      prompt: quizItem.prompt,
      supportedModes: [],
      data: { options: seededShuffle(options, rand) },
    },
  };
}
