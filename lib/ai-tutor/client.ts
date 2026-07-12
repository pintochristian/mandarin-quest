import Anthropic from "@anthropic-ai/sdk";

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  // isMockMode() is checked before this is ever called, so a missing key
  // here means it was unset by something after startup — treat as a real
  // configuration error rather than silently falling back.
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env to enable the AI tutor.",
    );
  }
  client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

export type ChatTurn = { role: "user" | "assistant"; content: string };

/**
 * True whenever no Anthropic key is configured — the app must run fully
 * without one (deployment requirement), so every AI-touching feature checks
 * this rather than letting a missing key surface as an error.
 */
export function isMockMode(): boolean {
  return !process.env.ANTHROPIC_API_KEY;
}

/** Deployment-level provider readiness — the inverse of isMockMode(), named
 * for readability wherever the question is "is a provider configured at
 * all" rather than "should this specific reply be mocked." See
 * lib/ai-tutor/settings.ts for the learner-level opt-in this combines with. */
export function hasAiProvider(): boolean {
  return !isMockMode();
}

/** True only for a real production deployment (Vercel's "production"
 * environment, or NODE_ENV=production off Vercel) — Vercel preview
 * deployments and local dev both count as non-production, where mock
 * replies remain a legitimate testing convenience. Mirrors the same
 * VERCEL_ENV convention already used in lib/auth.ts. */
function isProductionDeployment(): boolean {
  if (process.env.VERCEL_ENV) return process.env.VERCEL_ENV === "production";
  return process.env.NODE_ENV === "production";
}

/** Thrown instead of ever faking a reply when this is a real production
 * deployment with no AI provider configured. Callers must surface this as
 * "unavailable," never catch-and-mock. */
export class AiUnavailableError extends Error {
  constructor() {
    super("No AI provider is currently connected.");
    this.name = "AiUnavailableError";
  }
}

const MOCK_REPLIES = [
  "That's a good try! Can you say a bit more about that?",
  "很好 (hěn hǎo)! Let's keep going — what else can you tell me?",
  "I understand. Try using one of the words from your recent lessons here.",
  "Nice! Let's practice that a different way — how would you ask a question about it?",
];

function mockTutorReply(history: ChatTurn[]): string {
  const pick = MOCK_REPLIES[history.length % MOCK_REPLIES.length];
  return `[Mock AI Tutor — development preview only, not connected to a real model] ${pick}`;
}

/**
 * Simulated response used only outside of production (local dev, Vercel
 * preview deployments) whenever ANTHROPIC_API_KEY isn't configured — a
 * clearly-labeled testing convenience, never shown in a real production
 * deployment. In production with no provider configured, this throws
 * AiUnavailableError instead of silently substituting a fake reply — the
 * core course must never depend on AI, but AI-flavored UI must also never
 * pretend to work when it can't.
 */
export async function getTutorReply(
  systemPrompt: string,
  history: ChatTurn[],
): Promise<string> {
  if (isMockMode()) {
    if (isProductionDeployment()) {
      throw new AiUnavailableError();
    }
    return mockTutorReply(history);
  }

  const anthropic = getClient();

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 300,
    system: systemPrompt,
    messages: history.map((turn) => ({ role: turn.role, content: turn.content })),
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock?.text ?? "";
}
