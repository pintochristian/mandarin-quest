import type { TtsProvider } from "@/lib/tts/provider";

export const openAiProvider: TtsProvider = {
  name: "openai",
  async synthesize(text: string): Promise<ArrayBuffer> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice: "alloy",
        input: text,
        response_format: "mp3",
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenAI TTS failed: ${res.status} ${await res.text()}`);
    }

    return res.arrayBuffer();
  },
};
