import { db } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import type {
  LevelContentInput,
  LevelOutlineInput,
  ExerciseInput,
} from "@/lib/validation/content";

/**
 * Shared content-import pipeline: everything that turns validated
 * lesson/level JSON into database rows. Used by both `prisma/seed.ts`
 * (build-time authoring) and the admin panel's JSON import endpoint
 * (runtime authoring) — this is the single code path that makes "add
 * content without touching application code" actually true.
 *
 * Content targets the knowledge graph (KnowledgeNode/NodeEdge/LessonNode)
 * rather than flat vocab/grammar tables: every grammar concept and vocab
 * word becomes a node, upserted by a stable `code` so the same word
 * reappearing across lessons resolves to one shared node (and one shared
 * mastery record) instead of a duplicate. Dialogue lines are additionally
 * mirrored into SENTENCE_PATTERN nodes keyed by lesson+order, independent
 * of the presentational Dialogue/DialogueLine rows (which are wholly owned
 * by the lesson and replaced on every re-import) so a learner's sentence
 * review history survives re-authoring the dialogue text.
 */

export async function importLanguage(code: string, name: string) {
  return db.language.upsert({
    where: { code },
    update: { name },
    create: { code, name },
  });
}

function vocabNodeCode(script: string) {
  return `vocab:${script}`;
}

export async function importFullyAuthoredLevel(
  languageId: string,
  level: LevelContentInput,
) {
  const dbLevel = await db.level.upsert({
    where: { languageId_index: { languageId, index: level.index } },
    update: {
      title: level.title,
      description: level.description,
      themeColor: level.themeColor,
    },
    create: {
      languageId,
      index: level.index,
      title: level.title,
      description: level.description,
      themeColor: level.themeColor,
    },
  });

  for (const mod of level.modules) {
    const dbModule = await db.module.upsert({
      where: { levelId_index: { levelId: dbLevel.id, index: mod.index } },
      update: {
        key: mod.key,
        title: mod.title,
        description: mod.description,
        worldIcon: mod.worldIcon,
        worldTheme: mod.worldTheme,
      },
      create: {
        levelId: dbLevel.id,
        index: mod.index,
        key: mod.key,
        title: mod.title,
        description: mod.description,
        worldIcon: mod.worldIcon,
        worldTheme: mod.worldTheme,
      },
    });

    // Chains sequential PREREQUISITE edges between a module's grammar nodes
    // in lesson order — a sensible graph-seed default; content authors can
    // declare richer prerequisites later without another migration.
    let previousGrammarNodeId: string | null = null;

    for (const lesson of mod.lessons) {
      const grammarNode = await db.knowledgeNode.upsert({
        where: { languageId_code: { languageId, code: lesson.grammar.code } },
        update: {
          type: "GRAMMAR",
          title: lesson.grammar.title,
          description: lesson.grammar.simpleExplanation,
          difficulty: lesson.grammar.difficulty,
          data: {
            simpleExplanation: lesson.grammar.simpleExplanation,
            visualExamples: lesson.grammar.visualExamples,
            quiz: lesson.grammar.quiz,
          },
        },
        create: {
          languageId,
          type: "GRAMMAR",
          code: lesson.grammar.code,
          title: lesson.grammar.title,
          description: lesson.grammar.simpleExplanation,
          difficulty: lesson.grammar.difficulty,
          data: {
            simpleExplanation: lesson.grammar.simpleExplanation,
            visualExamples: lesson.grammar.visualExamples,
            quiz: lesson.grammar.quiz,
          },
        },
      });

      const dbLesson = await db.lesson.upsert({
        where: { moduleId_index: { moduleId: dbModule.id, index: lesson.index } },
        update: {
          title: lesson.title,
          situationTag: lesson.situationTag,
          estimatedMinutes: lesson.estimatedMinutes,
          isPublished: lesson.isPublished,
          outline: Prisma.JsonNull,
        },
        create: {
          module: { connect: { id: dbModule.id } },
          index: lesson.index,
          title: lesson.title,
          situationTag: lesson.situationTag,
          estimatedMinutes: lesson.estimatedMinutes,
          isPublished: lesson.isPublished,
        },
      });

      // Node links are wholly owned by the lesson's authoring and rebuilt on
      // every re-import (mirrors the old LessonVocabulary pattern) — but the
      // KnowledgeNode rows themselves are upserted by stable `code`, never
      // deleted, so mastery history for words/grammar that reappear across
      // lessons is preserved.
      await db.lessonNode.deleteMany({ where: { lessonId: dbLesson.id } });
      await db.lessonNode.create({
        data: {
          lessonId: dbLesson.id,
          nodeId: grammarNode.id,
          role: "TEACHES",
          order: 0,
        },
      });

      for (const [i, vocab] of lesson.vocabulary.entries()) {
        const vocabNode = await db.knowledgeNode.upsert({
          where: {
            languageId_code: { languageId, code: vocabNodeCode(vocab.script) },
          },
          update: {
            type: "VOCAB",
            title: vocab.script,
            description: vocab.english,
            data: {
              script: vocab.script,
              romanization: vocab.romanization,
              english: vocab.english,
              audioKey: vocab.audioKey,
              frequencyRank: vocab.frequencyRank,
              partOfSpeech: vocab.partOfSpeech,
            },
          },
          create: {
            languageId,
            type: "VOCAB",
            code: vocabNodeCode(vocab.script),
            title: vocab.script,
            description: vocab.english,
            data: {
              script: vocab.script,
              romanization: vocab.romanization,
              english: vocab.english,
              audioKey: vocab.audioKey,
              frequencyRank: vocab.frequencyRank,
              partOfSpeech: vocab.partOfSpeech,
            },
          },
        });
        await db.lessonNode.create({
          data: {
            lessonId: dbLesson.id,
            nodeId: vocabNode.id,
            role: "TEACHES",
            order: i + 1,
          },
        });
      }

      if (lesson.conversationGoal) {
        const goal = lesson.conversationGoal;
        const goalNode = await db.knowledgeNode.upsert({
          where: { languageId_code: { languageId, code: goal.code } },
          update: {
            type: "CONVERSATION_GOAL",
            title: goal.title,
            description: goal.description,
            data: {},
          },
          create: {
            languageId,
            type: "CONVERSATION_GOAL",
            code: goal.code,
            title: goal.title,
            description: goal.description,
            data: {},
          },
        });
        await db.lessonNode.create({
          data: { lessonId: dbLesson.id, nodeId: goalNode.id, role: "GOAL", order: 1000 },
        });
      }

      // Dialogue and exercises are wholly owned by the lesson's content
      // authoring, so re-importing replaces them outright rather than
      // diffing — simplest way to keep imports idempotent. Each dialogue
      // line also gets a stable SENTENCE_PATTERN node (keyed by lesson+order,
      // not by the dialogue row's id, since the dialogue row is recreated
      // every import) so a learner's SRS history for a sentence survives
      // re-authoring the dialogue text around it.
      await db.dialogue.deleteMany({ where: { lessonId: dbLesson.id } });
      const dbDialogue = await db.dialogue.create({
        data: {
          lessonId: dbLesson.id,
          title: lesson.dialogue.title,
          situationTag: lesson.dialogue.situationTag,
        },
      });
      for (const [i, line] of lesson.dialogue.lines.entries()) {
        await db.dialogueLine.create({
          data: {
            dialogueId: dbDialogue.id,
            order: i,
            speaker: line.speaker,
            script: line.script,
            romanization: line.romanization,
            english: line.english,
            audioKey: line.audioKey,
          },
        });

        const sentenceCode = `sentence:${dbLesson.id}:${i}`;
        const sentenceNode = await db.knowledgeNode.upsert({
          where: { languageId_code: { languageId, code: sentenceCode } },
          update: {
            type: "SENTENCE_PATTERN",
            title: line.script,
            description: line.english,
            data: {
              script: line.script,
              romanization: line.romanization,
              english: line.english,
            },
          },
          create: {
            languageId,
            type: "SENTENCE_PATTERN",
            code: sentenceCode,
            title: line.script,
            description: line.english,
            data: {
              script: line.script,
              romanization: line.romanization,
              english: line.english,
            },
          },
        });
        await db.lessonNode.create({
          data: {
            lessonId: dbLesson.id,
            nodeId: sentenceNode.id,
            role: "REVIEWS",
            order: 100 + i,
          },
        });
      }

      await db.exercise.deleteMany({ where: { lessonId: dbLesson.id } });
      for (const exercise of lesson.exercises as ExerciseInput[]) {
        await db.exercise.create({
          data: {
            lessonId: dbLesson.id,
            type: exercise.type,
            order: exercise.order,
            prompt: exercise.prompt,
            data: exercise.data,
            supportedModes: exercise.supportedModes,
            // Best default until content is authored with per-exercise node
            // tags: attribute a wrong answer to the lesson's grammar focus,
            // which is at least directionally right for mistake analytics.
            primaryNodeId: grammarNode.id,
          },
        });
      }

      if (previousGrammarNodeId && previousGrammarNodeId !== grammarNode.id) {
        await db.nodeEdge.upsert({
          where: {
            fromNodeId_toNodeId_relation: {
              fromNodeId: previousGrammarNodeId,
              toNodeId: grammarNode.id,
              relation: "PREREQUISITE",
            },
          },
          update: {},
          create: {
            fromNodeId: previousGrammarNodeId,
            toNodeId: grammarNode.id,
            relation: "PREREQUISITE",
          },
        });
      }
      previousGrammarNodeId = grammarNode.id;
    }
  }

  return dbLevel;
}

export async function importOutlineLevel(languageId: string, level: LevelOutlineInput) {
  const dbLevel = await db.level.upsert({
    where: { languageId_index: { languageId, index: level.index } },
    update: {
      title: level.title,
      description: level.description,
      themeColor: level.themeColor,
    },
    create: {
      languageId,
      index: level.index,
      title: level.title,
      description: level.description,
      themeColor: level.themeColor,
    },
  });

  for (const mod of level.modules) {
    const dbModule = await db.module.upsert({
      where: { levelId_index: { levelId: dbLevel.id, index: mod.index } },
      update: {
        key: mod.key,
        title: mod.title,
        description: mod.description,
        worldIcon: mod.worldIcon,
        worldTheme: mod.worldTheme,
      },
      create: {
        levelId: dbLevel.id,
        index: mod.index,
        key: mod.key,
        title: mod.title,
        description: mod.description,
        worldIcon: mod.worldIcon,
        worldTheme: mod.worldTheme,
      },
    });

    for (const lesson of mod.lessons) {
      await db.lesson.upsert({
        where: { moduleId_index: { moduleId: dbModule.id, index: lesson.index } },
        update: {
          title: lesson.title,
          situationTag: lesson.situationTag,
          isPublished: false,
          outline: {
            grammarGoal: lesson.grammarGoal,
            vocabularyGoal: lesson.vocabularyGoal,
            conversationGoal: lesson.conversationGoal,
          },
        },
        create: {
          moduleId: dbModule.id,
          index: lesson.index,
          title: lesson.title,
          situationTag: lesson.situationTag,
          isPublished: false,
          outline: {
            grammarGoal: lesson.grammarGoal,
            vocabularyGoal: lesson.vocabularyGoal,
            conversationGoal: lesson.conversationGoal,
          },
        },
      });
    }
  }

  return dbLevel;
}
