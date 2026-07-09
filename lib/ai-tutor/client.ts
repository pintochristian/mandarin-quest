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

const MOCK_REPLIES = [
  "That's a good try! Can you say a bit more about that?",
  "很好 (hěn hǎo)! Let's keep going — what else can you tell me?",
  "I understand. Try using one of the words from your recent lessons here.",
  "Nice! Let's practice that a different way — how would you ask a question about it?",
];

function mockTutorReply(history: ChatTurn[]): string {
  const pick = MOCK_REPLIES[history.length % MOCK_REPLIES.length];
  return `[Mock AI Tutor — set ANTHROPIC_API_KEY to enable real replies] ${pick}`;
}

/**
 * Simulated response used whenever ANTHROPIC_API_KEY isn't configured, so
 * the AI tutor, conversation sandbox, and mistake classification all keep
 * working (clearly labeled as mock) rather than erroring out. A real
 * Anthropic key is an optional upgrade, never a requirement to run the app.
 */
export async function getTutorReply(
  systemPrompt: string,
  history: ChatTurn[],
): Promise<string> {
  if (isMockMode()) {
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
