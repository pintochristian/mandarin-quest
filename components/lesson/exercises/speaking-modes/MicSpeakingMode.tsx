"use client";

import { useEffect, useState } from "react";
import { Mic, Square } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AudioButton } from "@/components/lesson/AudioButton";
import { useSpeechRecognition } from "@/lib/speech/useSpeechRecognition";
import { heuristicScorer } from "@/lib/speech/pronunciationScore";
import { useSettingsStore } from "@/store/settings-store";
import { cn } from "@/lib/utils";

export function MicSpeakingMode({
  exerciseId,
  targetScript,
  targetRomanization,
  onAnswered,
}: {
  exerciseId: string;
  targetScript: string;
  targetRomanization: string;
  onAnswered: (correct: boolean) => void;
}) {
  const { isListening, transcript, error, start, stop } = useSpeechRecognition();
  const speakingSensitivity = useSettingsStore((s) => s.speakingSensitivity);
  const [result, setResult] = useState<{
    accuracyScore: number;
    toneScore: number;
  } | null>(null);

  // Score once a transcript lands (recognition ended with a result).
  useEffect(() => {
    if (!transcript || result || isListening) return;

    const scored = heuristicScorer.score({ transcript, targetScript });
    setResult(scored);
    const passed = scored.accuracyScore >= 1 - speakingSensitivity * 0.6;
    fetch("/api/speech/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exerciseId,
        transcript,
        targetText: targetScript,
        accuracyScore: scored.accuracyScore,
        toneScore: scored.toneScore,
      }),
    }).finally(() => onAnswered(passed));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript, isListening]);

  return (
    <div className="space-y-4">
      <p className="text-center text-sm font-medium text-muted-foreground">
        Say this out loud.
      </p>
      <Card className="flex flex-col items-center gap-2 rounded-2xl p-8 text-center">
        <AudioButton text={targetScript} />
        <span className="font-zh mt-2 text-2xl">{targetScript}</span>
        <span className="text-sm text-muted-foreground">{targetRomanization}</span>
        {transcript && (
          <p className="mt-2 text-sm text-muted-foreground">
            Heard: <span className="font-zh">{transcript}</span>
          </p>
        )}
        {result && (
          <p
            className={cn(
              "text-sm font-medium",
              result.accuracyScore >= 0.7 ? "text-emerald-600" : "text-amber-600",
            )}
          >
            {Math.round(result.accuracyScore * 100)}% match (approximate — see note in
            Settings)
          </p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </Card>
      {!result &&
        (isListening ? (
          <Button
            variant="destructive"
            className="w-full gap-2 rounded-full"
            onClick={stop}
          >
            <Square className="size-4" />
            Stop
          </Button>
        ) : (
          <Button className="w-full gap-2 rounded-full" onClick={start}>
            <Mic className="size-4" />
            Tap to speak
          </Button>
        ))}
    </div>
  );
}
