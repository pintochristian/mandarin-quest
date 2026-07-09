import { z } from "zod";
import { grammarExampleSchema, vocabularyItemSchema } from "@/lib/validation/content";

/**
 * Per-type payloads for `KnowledgeNode.data` — the same discriminated
 * pattern `Exercise.data` already uses. Only VOCAB/GRAMMAR/SENTENCE_PATTERN
 * are populated by the current content-authoring pipeline (lib/content/import.ts);
 * the remaining node types are scaffolded here so later phases (13, 15, 18)
 * can add real payloads without another schema migration.
 */

export const vocabNodeDataSchema = vocabularyItemSchema;

export const grammarNodeDataSchema = z.object({
  simpleExplanation: z.string().min(1),
  visualExamples: z.array(grammarExampleSchema).min(2),
  quiz: z
    .array(
      z.object({
        prompt: z.string().min(1),
        options: z.array(z.string().min(1)).min(2),
        correctIndex: z.number().int().min(0),
      }),
    )
    .min(1),
});

export const sentencePatternNodeDataSchema = z.object({
  script: z.string().min(1),
  romanization: z.string().min(1),
  english: z.string().min(1),
});

/** Placeholder shape for node types not yet authored by any pipeline. */
export const genericNodeDataSchema = z.record(z.string(), z.unknown());

export type VocabNodeData = z.infer<typeof vocabNodeDataSchema>;
export type GrammarNodeData = z.infer<typeof grammarNodeDataSchema>;
export type SentencePatternNodeData = z.infer<typeof sentencePatternNodeDataSchema>;
