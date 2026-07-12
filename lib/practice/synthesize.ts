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

/** A standard practice question — an ExerciseRecord (renderable by the
 * existing, unmodified ExerciseRenderer) plus the bookkeeping Practice
 * Anytime needs to log the attempt against the right node. */
export type ExerciseQuestion = {
  kind: "exercise";
  exerciseRecord: ExerciseRecord;
  nodeId: string;
  mode: string;
};

export type MatchPair = { nodeId: string; script: string; romanization: string; english: string };

/** "Match word and meaning" doesn't fit the single-Exercise-record shape
 * (it covers several nodes at once and has its own tap-to-pair UI,
 * components/practice/MatchPairsQuestion.tsx) — a distinct question kind
 * rather than stretching ExerciseRecord/ExerciseRenderer to cover it. */
export type MatchQuestion = {
  kind: "match";
  mode: "MATCH_PAIRS";
  pairs: MatchPair[];
};

export type PracticeQuestion = ExerciseQuestion | MatchQuestion;

export const VOCAB_FORMATS = ["CN_RECOGNITION", "EN_RECALL", "CN_TO_PINYIN"] as const;
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
): ExerciseQuestion | null {
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
      kind: "exercise",
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

  if (format === "EN_RECALL") {
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
      kind: "exercise",
      nodeId: node.id,
      mode: format,
      exerciseRecord: {
        id: `practice:${node.id}:${format}`,
        type: "MULTIPLE_CHOICE",
        order: 0,
        // MultipleChoiceExercise only ever renders data.questionScript,
        // never data.questionEnglish (that field is declared in the schema
        // but dead in every existing render path — LISTENING_COMPREHENSION
        // drops it too, see ExerciseRenderer's remap) — folding the target
        // word into the prompt itself instead of relying on it.
        prompt: `Which word means "${data.english}"?`,
        supportedModes: [],
        data: { options },
      },
    };
  }

  // CN_TO_PINYIN — show the Chinese script with no romanization hint (that
  // would give the answer away), options are plain pinyin strings so
  // MultipleChoiceExercise's option renderer doesn't apply font-zh to them.
  const options = seededShuffle(
    [
      { text: data.romanization, isCorrect: true },
      ...distractors.map((d) => ({ text: d.romanization, isCorrect: false })),
    ],
    rand,
  );
  return {
    kind: "exercise",
    nodeId: node.id,
    mode: format,
    exerciseRecord: {
      id: `practice:${node.id}:${format}`,
      type: "MULTIPLE_CHOICE",
      order: 0,
      prompt: "How is this pronounced?",
      supportedModes: [],
      data: { questionScript: data.script, options },
    },
  };
}

/**
 * Silent shadow-listen acknowledgement: play the audio, learner taps "I
 * practiced" once they've repeated it — no distractors, no ambiguity, so
 * this is safe to synthesize directly from any node with a
 * script/romanization/english shape (VOCAB or SENTENCE_PATTERN). Reuses
 * ShadowListenMode unchanged via a SPEAKING exercise record whose
 * supportedModes is deliberately just [SHADOW_LISTEN] so
 * resolveInteractionMode always lands on it regardless of practiceMode.
 * The other SpeakingData fields are unused by ShadowListenMode but the
 * type requires them — filled with harmless fallbacks, never rendered.
 */
export function synthesizeShadowListenQuestion(
  node: PracticeNode,
  seed: string,
): ExerciseQuestion | null {
  void seed;
  const data = node.data as { script?: string; romanization?: string; english?: string };
  if (!data?.script || !data?.romanization || !data?.english) return null;

  return {
    kind: "exercise",
    nodeId: node.id,
    mode: "SHADOW_LISTEN",
    exerciseRecord: {
      id: `practice:${node.id}:SHADOW_LISTEN`,
      type: "SPEAKING",
      order: 0,
      prompt: "Listen and repeat.",
      supportedModes: ["SHADOW_LISTEN"],
      data: {
        targetScript: data.script,
        targetRomanization: data.romanization,
        targetEnglish: data.english,
        tokens: [data.script],
        distractorTokens: [],
        acceptablePinyin: [data.romanization],
        englishPrompt: data.english,
        dialogueChoiceOptions: [
          {
            script: data.script,
            romanization: data.romanization,
            english: data.english,
            isCorrect: true,
          },
          { script: "—", romanization: "—", english: "(not applicable)", isCorrect: false },
        ],
        aiScenarioPrompt: data.english,
      },
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
): ExerciseQuestion | null {
  const data = node.data as GrammarNodeData;
  if (!data?.quiz || data.quiz.length === 0) return null;

  const rand = createRng(seed);
  const quizItem = data.quiz[Math.floor(rand() * data.quiz.length)];

  const options = quizItem.options.map((text, i) => ({
    text,
    isCorrect: i === quizItem.correctIndex,
  }));

  return {
    kind: "exercise",
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

const MATCH_PAIR_COUNT = 4;
const MIN_MATCH_PAIRS = 3;

/**
 * "Match word and meaning": picks up to MATCH_PAIR_COUNT VOCAB nodes from
 * the given pool and returns them as pairs for a tap-to-match UI. Returns
 * null rather than a too-small round if fewer than MIN_MATCH_PAIRS
 * candidates are available — a 2-pair match isn't a meaningful exercise.
 */
export function synthesizeMatchQuestion(
  nodes: PracticeNode[],
  seed: string,
): MatchQuestion | null {
  const rand = createRng(seed);
  const candidates = nodes
    .filter((n) => n.type === "VOCAB")
    .map((n) => ({ node: n, data: n.data as VocabNodeData }))
    .filter((c): c is { node: PracticeNode; data: VocabNodeData } =>
      Boolean(c.data?.script && c.data?.english),
    );
  if (candidates.length < MIN_MATCH_PAIRS) return null;

  const picked = seededSample(candidates, MATCH_PAIR_COUNT, rand);
  return {
    kind: "match",
    mode: "MATCH_PAIRS",
    pairs: picked.map(({ node, data }) => ({
      nodeId: node.id,
      script: data.script,
      romanization: data.romanization,
      english: data.english,
    })),
  };
}
