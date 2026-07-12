# Levels 1–2 Remediation Report

Generated from the actual content in `content/zh/` (level-1.ts + the 4
imported JSON batches), cross-checked with `lib/content/lint.ts` run
against the merged 22-lesson course. Companion data file:
`content/zh/vocabulary-reuse-report.json` (176 words, machine-readable,
built for the Level 3–8 authoring process to consume directly).

No lessons were rewritten to produce this report — per the approved scope,
this phase is audit-only. Zero `ERROR`-severity lint findings were found
against the existing 22 lessons (no missing/ambiguous answer keys, no
mic-only or AI-dependent paths, no duplicate titles) — the content is
structurally correct; the findings below are about depth and reuse, not
correctness.

## 1. Vocabulary that never reappears after introduction

**108 of 176 unique words (61.4%) are single-exposure** — introduced once,
never reused in a later lesson's vocabulary list or dialogue, within
Levels 1–2. The full list, with each word's script/pinyin/English and
introducing lesson, is in `content/zh/vocabulary-reuse-report.json`
(`status: "SINGLE_EXPOSURE"`). This is the single biggest content-quality
gap in the current course — larger than lesson count or exercise variety.

Concrete pattern: situational nouns (出租车 taxi, 机场 airport, 邻居
neighbour, 超市 supermarket, 菜单 menu, 老板 shop owner) are taught inside
one situational lesson and never touched again, even within lessons
covering closely related situations later in the same level.

## 2. High-value words needing deliberate reinforcement in Levels 2–4

Prioritizing by (a) high spoken frequency and (b) how load-bearing the word
is for later grammar (e.g. words that combine with upcoming patterns).
Pulled from the single-exposure list:

- **Time/scheduling**: 明天 (tomorrow), 今天 (today), 见面 (to meet up) —
  essential for Level 3's "making plans" module; currently only appear once
  in Level 1.
- **Location/direction core**: 左边/右边 (left/right), 一直 (straight
  ahead), 远/近 (far/close), 路 (road) — needed again for Level 3's public
  transport and directions content.
- **Restaurant/food core**: 好吃 (tasty), 辣 (spicy), 菜单 (menu), 服务员
  (waiter, from Level 1 daily-life) — needed again the moment Level 3
  revisits food/service scenarios at higher complexity.
- **People/family**: 家人 (family members), 同学 (classmate) — natural
  reinforcement material for Level 4's social-conversation module.
- **Shopping core**: 便宜/贵 (cheap/expensive), 打折 (discount), 颜色
  (colour) — needed again if Level 3+ revisits shopping in a more complex
  register.

**Policy recommendation** (also encoded in the JSON report's
`requirementForLevels3to8` field): every new level's dialogues must
recycle at least 40% of the prior level's single-exposure words before
leaning on brand-new vocabulary, and this must be checked with
`lib/content/lint.ts`'s `VOCAB_NEVER_REUSED` rule before any future level
is considered complete.

## 3. Grammar concepts needing bridge or reinforcement lessons

All 22 grammar concepts are formally taught in exactly one lesson each
(`GRAMMAR_NOT_REINFORCED` fired for every one of them) — there is no
lesson in Levels 1–2 whose *primary* focus is reinforcing an earlier
grammar concept. That said, several concepts get genuine informal
reinforcement through later lessons' explanatory text calling back to them
(在 as location, lesson 5, is explicitly called back to teach the
progressive-aspect use in lesson 14; 有 for possession, lesson 9, is called
back for the existence use in lesson 18) — this is good practice, just not
schema-visible as "reinforcement."

Concepts most in need of a dedicated bridge/reinforcement treatment before
Level 3 builds on them:
- **measure-word-ge** (个) — only taught in lesson 10, despite measure
  words as a category being used as early as lesson 3 (要 + measure words)
  without a general explanation. Level 3 should open with a short
  measure-word review/bridge module before introducing new ones (瓶,
  张, etc.).
- **cong-dao-range** (从...到...) — a genuine syntactic jump relative to
  what came before it; Level 3's transport/directions content should
  reinforce it explicitly rather than assume it's solid.
- **bi-comparison** (比) — introduced late in Level 2 with no lead-in
  scaffolding lesson; Level 4's comparison-heavy grammar (更/最/一样) needs
  a short 比 refresher before extending it.

## 4. Existing lessons needing more varied exercises

**All 22 lessons, with zero exceptions**, use the identical exercise-type
sequence: 1 MULTIPLE_CHOICE, 1 LISTENING, 1 FILL_BLANK, 1 TRANSLATION,
1 SPEAKING, 1 RAPID_REVIEW, always in that order (confirmed by
`lib/content/lint.ts`'s `RIGID_EXERCISE_TEMPLATE` check, which fired
against both levels). This isn't a defect in any individual lesson — the
distractor quality within that template is good — but it means the course
never varies pacing or emphasis lesson to lesson (e.g. a listening-heavy
lesson always has exactly the same 1 LISTENING exercise as a
grammar-heavy one). Level 3+ authoring should vary exercise counts and
mix per lesson based on what that lesson is actually teaching, not default
to the fixed template.

## 5. Where cumulative module/level reviews should be inserted

None exist today — there is no lesson in Levels 1–2 whose purpose is
"review the last N lessons," only new-content lessons. Recommended
insertion points once Level 3 begins:
- End of each *module* (roughly every 2–4 lessons): a short cumulative
  review lesson mixing vocabulary/grammar from that module's lessons only.
- End of each *level*: a milestone assessment lesson requiring the learner
  to produce original sentences (not just recognize answers) — e.g. "order
  a meal," "give your address to a taxi driver" — combining everything
  taught in that level.
- Level 1→2 boundary specifically: currently there is no bridge lesson at
  all; a learner goes straight from Level 1's last lesson into Level 2's
  first with no consolidation checkpoint.

## 6. Does Level 1 or 2 need additional bridge lessons?

Yes — two concrete gaps found:
- A **measure-word overview** bridge lesson before Level 1 module 3
  (Getting Around) would fix the pacing issue in finding #3 above (杯 used
  in lesson 3, general measure-word grammar not taught until lesson 10).
- A **Level 1→2 consolidation** lesson (see #5) — Level 2 currently starts
  cold with no explicit tie-back to Level 1 vocabulary, which likely
  contributes to why Level 2's own dialogues under-utilize Level 1
  vocabulary (a limitation of this report's per-level scoping, noted in
  finding #7 below, rather than a confirmed content gap — worth a follow-up
  check once cross-level linting exists).

## 7. Existing content bugs needing immediate correction

**None found requiring immediate correction.** The lint pass returned zero
`ERROR`-severity findings against all 22 lessons. The one real defect
identified this session — `TranslationExercise`/`TypePinyinMode` grading
plain toneless pinyin as wrong against toned-only `acceptableAnswers` — was
already fixed at the code level (`normalizeAnswer`/`normalizePinyinAnswer`
in `lib/utils.ts`), which is the correct fix (one grading function, not 22
lessons' worth of hand-added answer variants). All 22 lessons' authored
pinyin was spot-checked against the correct answer scripts during that fix
and found accurate — no tone-mark transcription errors found.

One known false-positive source in this report: `lib/content/lint.ts`'s
`DIALOGUE_UNEXPLAINED_MATERIAL` check is scoped per-level (matches the
linter's actual job — linting one level's import in isolation), so when
run against Level 2 alone it doesn't know about Level 1's vocabulary and
over-flags ordinary Level-1-sourced function words in Level 2 dialogue as
"unexplained." This is a property of running the linter standalone across
multiple levels for this report, not a bug in the linter itself (which
always has the full prior-level context available for real imports, since
it queries the database). Not treated as a real finding.

## 8. Vocabulary-recycling specification for future content

Encoded machine-readably in `content/zh/vocabulary-reuse-report.json` and
enforced going forward by `lib/content/lint.ts`. The policy:

1. Every vocabulary item introduced in a lesson must be authored with the
   deliberate intention of reappearing in at least one later lesson's
   dialogue within the same level, OR be explicitly low-priority
   "situational" vocabulary (a proper noun, a one-off cultural reference)
   that's acceptable as single-exposure.
2. Before a new level is considered complete, run the linter and review
   every `VOCAB_NEVER_REUSED` finding — each one should be either
   deliberately reinforced (add a dialogue line using it) or explicitly
   accepted as situational (document why in the PR/import notes).
3. High-frequency function words and grammar-relevant vocabulary
   (measure words, time expressions, location words) should never be
   single-exposure — these are exactly the words later grammar depends on.
4. Target reuse rate for Levels 3–8: **at least 50%** formally/dialogue
   reused within the same level, and cumulative review lessons (see #5)
   should deliberately pull from the *prior* level's single-exposure list
   first — `content/zh/vocabulary-reuse-report.json` is structured
   specifically to make that lookup mechanical rather than manual.
