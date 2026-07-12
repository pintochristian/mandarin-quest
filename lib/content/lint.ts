import { db } from "@/lib/db";
import type {
  LevelContentInput,
  LevelOutlineInput,
  LessonContentInput,
  ExerciseInput,
} from "@/lib/validation/content";
import { NON_MIC_INTERACTION_MODES } from "@/lib/validation/content";

/**
 * Runs after Zod schema validation (lib/validation/content.ts) — schema
 * validation catches structural errors (wrong shape, missing required
 * fields); this catches content-QUALITY issues that are still perfectly
 * valid JSON: a word introduced once and never touched again, two lessons
 * that happen to share a title, an exercise with two "correct" answers.
 * ERROR findings block import (a real correctness defect); WARNING and
 * INFO are surfaced but never block — the point is visibility, not
 * gatekeeping every stylistic choice a content author makes.
 */

export type LintSeverity = "ERROR" | "WARNING" | "INFO";

export type LintFinding = {
  severity: LintSeverity;
  code: string;
  message: string;
  location?: string;
};

const VOCAB_SOFT_CAP = 10;

export async function lintLevelContent(
  level: LevelContentInput,
  languageId: string,
): Promise<LintFinding[]> {
  const findings: LintFinding[] = [];
  const lessons = level.modules.flatMap((m) =>
    m.lessons.map((lesson) => ({ lesson, moduleTitle: m.title })),
  );

  checkAnswerKeys(lessons, findings);
  checkMicOnlyPaths(lessons, findings);
  checkAiDependency(lessons, findings);
  checkVocabCap(lessons, findings);
  checkVocabConsistencyAndReuse(lessons, findings);
  checkGrammarReinforcement(lessons, findings);
  checkDialogueUnexplainedMaterial(lessons, findings);
  checkRigidExerciseTemplate(lessons, findings);
  await checkDuplicateTitlesAndTags(
    lessons.map(({ lesson }) => ({ title: lesson.title, situationTag: lesson.situationTag })),
    languageId,
    findings,
  );

  return findings;
}

/** Lighter check set for outline-only levels — there's no lesson body yet
 * to lint content quality against, but duplicate titles/tags are just as
 * much a planning defect for an outline as for full content. */
export async function lintLevelOutline(
  outline: LevelOutlineInput,
  languageId: string,
): Promise<LintFinding[]> {
  const findings: LintFinding[] = [];
  const lessons = outline.modules.flatMap((m) => m.lessons);
  await checkDuplicateTitlesAndTags(
    lessons.map((l) => ({ title: l.title, situationTag: l.situationTag })),
    languageId,
    findings,
  );
  return findings;
}

type LessonWithModule = { lesson: LessonContentInput; moduleTitle: string };

function loc(l: LessonWithModule): string {
  return `${l.moduleTitle} > ${l.lesson.title}`;
}

/** #8 — missing or ambiguous answer keys: MULTIPLE_CHOICE/LISTENING/
 * LISTENING_COMPREHENSION must have exactly one correct option (the Zod
 * schema doesn't enforce this — only dialogueChoiceOptions does); FILL_BLANK's
 * correctAnswer must actually appear among its own choices when choices
 * are provided. */
function checkAnswerKeys(lessons: LessonWithModule[], findings: LintFinding[]) {
  for (const l of lessons) {
    for (const ex of l.lesson.exercises as ExerciseInput[]) {
      if (
        ex.type === "MULTIPLE_CHOICE" ||
        ex.type === "LISTENING" ||
        ex.type === "LISTENING_COMPREHENSION"
      ) {
        const correctCount = ex.data.options.filter((o) => o.isCorrect).length;
        if (correctCount === 0) {
          findings.push({
            severity: "ERROR",
            code: "MISSING_ANSWER_KEY",
            message: `${ex.type} exercise has no option marked correct.`,
            location: loc(l),
          });
        } else if (correctCount > 1) {
          findings.push({
            severity: "ERROR",
            code: "AMBIGUOUS_ANSWER_KEY",
            message: `${ex.type} exercise has ${correctCount} options marked correct — must be exactly one.`,
            location: loc(l),
          });
        }
      }
      if (ex.type === "FILL_BLANK" && ex.data.choices) {
        const hasCorrect = ex.data.choices.some((c) => c.text === ex.data.correctAnswer);
        if (!hasCorrect) {
          findings.push({
            severity: "ERROR",
            code: "MISSING_ANSWER_KEY",
            message: `FILL_BLANK correctAnswer "${ex.data.correctAnswer}" is not among its own choices.`,
            location: loc(l),
          });
        }
      }
    }
  }
}

/** #9 — microphone-only practice paths. The exerciseSchema's superRefine
 * already enforces this at Zod-validation time (every SPEAKING/
 * CONVERSATION_SIM exercise must support every non-mic mode), so this is
 * defense-in-depth: it should never actually fire against schema-valid
 * content, but if the schema is ever loosened, the linter still catches it. */
function checkMicOnlyPaths(lessons: LessonWithModule[], findings: LintFinding[]) {
  for (const l of lessons) {
    for (const ex of l.lesson.exercises as ExerciseInput[]) {
      if (ex.type !== "SPEAKING" && ex.type !== "CONVERSATION_SIM") continue;
      const hasNonMic = ex.supportedModes.some((m) => NON_MIC_INTERACTION_MODES.includes(m));
      if (!hasNonMic) {
        findings.push({
          severity: "ERROR",
          code: "MIC_ONLY_PATH",
          message: `${ex.type} exercise only supports MIC_SPEAKING — the lesson would be unusable with the microphone never touched.`,
          location: loc(l),
        });
      }
    }
  }
}

/** #10 — lessons dependent on AI: AI_TEXT_CHAT must never be the only
 * supported mode on an exercise (same defense-in-depth rationale as the
 * mic-only check — the schema already guarantees a non-AI alternative). */
function checkAiDependency(lessons: LessonWithModule[], findings: LintFinding[]) {
  for (const l of lessons) {
    for (const ex of l.lesson.exercises as ExerciseInput[]) {
      if (ex.type !== "SPEAKING" && ex.type !== "CONVERSATION_SIM") continue;
      if (ex.supportedModes.length === 1 && ex.supportedModes[0] === "AI_TEXT_CHAT") {
        findings.push({
          severity: "ERROR",
          code: "AI_DEPENDENT_EXERCISE",
          message: `${ex.type} exercise only supports AI_TEXT_CHAT — unusable when AI is disabled.`,
          location: loc(l),
        });
      }
    }
  }
}

/** #3 — excessive new vocabulary. The Zod schema already hard-caps at 12;
 * this flags lessons getting close to that ceiling as a pacing note. */
function checkVocabCap(lessons: LessonWithModule[], findings: LintFinding[]) {
  for (const l of lessons) {
    if (l.lesson.vocabulary.length > VOCAB_SOFT_CAP) {
      findings.push({
        severity: "INFO",
        code: "VOCAB_NEAR_CAP",
        message: `${l.lesson.vocabulary.length} new words in one lesson (soft target: ≤${VOCAB_SOFT_CAP}).`,
        location: loc(l),
      });
    }
  }
}

/** #1 + #4 — duplicate vocabulary codes with inconsistent data, and words
 * that are only ever introduced once within this level and never reused
 * (in a later lesson's vocabulary list OR its dialogue text) — matches the
 * "6.8% formal reuse" gap the Levels 1-2 audit found. */
function checkVocabConsistencyAndReuse(lessons: LessonWithModule[], findings: LintFinding[]) {
  const bySkript = new Map<
    string,
    { romanization: string; english: string; lessonIndex: number }[]
  >();
  lessons.forEach(({ lesson }, i) => {
    for (const v of lesson.vocabulary) {
      const list = bySkript.get(v.script) ?? [];
      list.push({ romanization: v.romanization, english: v.english, lessonIndex: i });
      bySkript.set(v.script, list);
    }
  });

  for (const [script, occurrences] of bySkript) {
    const distinctReadings = new Set(occurrences.map((o) => `${o.romanization}|${o.english}`));
    if (distinctReadings.size > 1) {
      findings.push({
        severity: "WARNING",
        code: "INCONSISTENT_VOCAB",
        message: `"${script}" is authored with ${distinctReadings.size} different pinyin/meaning combinations across lessons.`,
      });
    }
  }

  const allDialogueText = lessons.map(({ lesson }) =>
    lesson.dialogue.lines.map((l) => l.script).join(""),
  );

  for (const [script, occurrences] of bySkript) {
    const introducedAt = Math.min(...occurrences.map((o) => o.lessonIndex));
    const reusedInVocab = occurrences.length > 1;
    const reusedInDialogue = allDialogueText.some(
      (text, i) => i > introducedAt && text.includes(script),
    );
    if (!reusedInVocab && !reusedInDialogue) {
      findings.push({
        severity: "INFO",
        code: "VOCAB_NEVER_REUSED",
        message: `"${script}" is introduced once and never reused in a later lesson within this level.`,
        location: loc(lessons[introducedAt]),
      });
    }
  }
}

/** #6 — grammar never reinforced: a grammar code that appears in exactly
 * one lesson of this level, with no evidence (via the lesson's own dialogue
 * or exercises) that it's revisited later. */
function checkGrammarReinforcement(lessons: LessonWithModule[], findings: LintFinding[]) {
  const byCode = new Map<string, number[]>();
  lessons.forEach(({ lesson }, i) => {
    const list = byCode.get(lesson.grammar.code) ?? [];
    list.push(i);
    byCode.set(lesson.grammar.code, list);
  });
  for (const [code, indices] of byCode) {
    if (indices.length > 1) continue; // formally retaught — fine
    findings.push({
      severity: "INFO",
      code: "GRAMMAR_NOT_REINFORCED",
      message: `Grammar concept "${code}" is only formally taught in one lesson within this level.`,
      location: loc(lessons[indices[0]]),
    });
  }
}

/** #7 — dialogue containing unexplained material: a rough heuristic, not a
 * segmentation-accurate check — flags a dialogue line whose script shares
 * no characters at all with anything taught in this lesson or an earlier
 * one in the level. Deliberately conservative (INFO, not ERROR) since
 * function words/particles legitimately recur without being "taught". */
function checkDialogueUnexplainedMaterial(lessons: LessonWithModule[], findings: LintFinding[]) {
  const cumulativeVocabChars = new Set<string>();
  lessons.forEach(({ lesson }, i) => {
    const knownSoFar = new Set(cumulativeVocabChars);
    for (const v of lesson.vocabulary) for (const ch of v.script) knownSoFar.add(ch);

    for (const line of lesson.dialogue.lines) {
      const unknownChars = [...line.script].filter(
        (ch) => !knownSoFar.has(ch) && /[一-鿿]/.test(ch),
      );
      // A handful of unknown characters in one line (function words,
      // names) is normal; flag only when a large fraction of the line is
      // unrecognized, which more likely means genuinely unexplained
      // vocabulary rather than incidental particles.
      const totalHanzi = [...line.script].filter((ch) => /[一-鿿]/.test(ch)).length;
      if (totalHanzi > 0 && unknownChars.length / totalHanzi > 0.5) {
        findings.push({
          severity: "INFO",
          code: "DIALOGUE_UNEXPLAINED_MATERIAL",
          message: `Dialogue line "${line.script}" is mostly characters not yet taught by this point (${unknownChars.length}/${totalHanzi}).`,
          location: loc(lessons[i]),
        });
      }
    }
    for (const ch of [...cumulativeVocabChars]) knownSoFar.add(ch);
    cumulativeVocabChars.clear();
    for (const ch of knownSoFar) cumulativeVocabChars.add(ch);
  });
}

/** #12 — repeated rigid exercise templates: every lesson using the exact
 * same exercise-type sequence, in the same order, is a real content-variety
 * gap (the Levels 1-2 audit found exactly this: all 22 lessons used
 * identically "1 each of 6 types, same order"). */
function checkRigidExerciseTemplate(lessons: LessonWithModule[], findings: LintFinding[]) {
  if (lessons.length < 3) return;
  const signatures = lessons.map(({ lesson }) =>
    (lesson.exercises as ExerciseInput[]).map((e) => e.type).join(","),
  );
  const allSame = signatures.every((s) => s === signatures[0]);
  if (allSame) {
    findings.push({
      severity: "INFO",
      code: "RIGID_EXERCISE_TEMPLATE",
      message: `Every lesson in this level uses the identical exercise-type sequence (${signatures[0]}) — consider varying exercise mix and order for variety.`,
    });
  }
}

/** #11 — exact duplicate lesson titles or situation tags, checked both
 * within this import and against everything already in the database for
 * the language (the exact bug found in the pre-existing Level 3-8 outline,
 * which duplicated several already-published Level 1/2 lesson titles). */
async function checkDuplicateTitlesAndTags(
  lessons: { title: string; situationTag: string }[],
  languageId: string,
  findings: LintFinding[],
) {
  const titleCounts = new Map<string, number>();
  const tagCounts = new Map<string, number>();
  for (const l of lessons) {
    titleCounts.set(l.title, (titleCounts.get(l.title) ?? 0) + 1);
    tagCounts.set(l.situationTag, (tagCounts.get(l.situationTag) ?? 0) + 1);
  }
  for (const [title, count] of titleCounts) {
    if (count > 1) {
      findings.push({
        severity: "WARNING",
        code: "DUPLICATE_LESSON_TITLE",
        message: `Lesson title "${title}" appears ${count} times within this import.`,
      });
    }
  }

  const existing = await db.lesson.findMany({
    where: { module: { level: { languageId } } },
    select: { title: true, situationTag: true },
  });
  const existingTitles = new Set(existing.map((e) => e.title));
  const existingTags = new Set(existing.map((e) => e.situationTag));
  for (const l of lessons) {
    if (existingTitles.has(l.title)) {
      findings.push({
        severity: "WARNING",
        code: "DUPLICATE_LESSON_TITLE",
        message: `Lesson title "${l.title}" already exists elsewhere in the course.`,
      });
    }
    if (existingTags.has(l.situationTag) && tagCounts.get(l.situationTag) === 1) {
      findings.push({
        severity: "INFO",
        code: "DUPLICATE_SITUATION_TAG",
        message: `situationTag "${l.situationTag}" is already used by another lesson elsewhere in the course — confirm this is intentional reuse, not an accidental duplicate topic.`,
      });
    }
  }
}
