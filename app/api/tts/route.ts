import { NextResponse } from "next/server";
import { z } from "zod";
import { getConfiguredServerProvider } from "@/lib/tts/provider";

const ttsSchema = z.object({ text: z.string().min(1).max(500) });

export async function POST(request: Request) {
  const provider = getConfiguredServerProvider();
  if (!provider) {
    return NextResponse.json(
      { error: "No premium TTS provider configured; use the browser fallback." },
      { status: 501 },
    );
  }

  const { text } = ttsSchema.parse(await request.json());

  try {
    const audio = await provider.synthesize(text);
    return new NextResponse(audio, {
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "TTS synthesis failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
