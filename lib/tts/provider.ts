import { elevenLabsProvider } from "@/lib/tts/elevenlabs";
import { openAiProvider } from "@/lib/tts/openai";

/**
 * Server-side TTS provider abstraction. The browser Web Speech API is the
 * always-available client-side default (lib/tts/browser.ts) — these
 * providers are optional upgrades used by /api/tts when a key is present.
 */
export interface TtsProvider {
  name: "elevenlabs" | "openai";
  synthesize(text: string): Promise<ArrayBuffer>;
}

export function getConfiguredServerProvider(): TtsProvider | null {
  if (process.env.ELEVENLABS_API_KEY) return elevenLabsProvider;
  if (process.env.OPENAI_API_KEY) return openAiProvider;
  return null;
}
