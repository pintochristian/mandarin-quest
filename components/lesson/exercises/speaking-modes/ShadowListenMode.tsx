"use client";

import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AudioButton } from "@/components/lesson/AudioButton";
import { useTts } from "@/lib/tts/useTts";

export function ShadowListenMode({
  targetScript,
  targetRomanization,
  targetEnglish,
  onAnswered,
}: {
  targetScript: string;
  targetRomanization: string;
  targetEnglish: string;
  onAnswered: (correct: boolean) => void;
}) {
  const { speak } = useTts();

  useEffect(() => {
    speak(targetScript);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <p className="text-center text-sm font-medium text-muted-foreground">
        Listen, then say it silently (or out loud) along with the audio.
      </p>
      <Card className="flex flex-col items-center gap-2 rounded-2xl p-8 text-center">
        <AudioButton text={targetScript} className="size-14" />
        <span className="font-zh mt-2 text-2xl">{targetScript}</span>
        <span className="text-sm text-muted-foreground">{targetRomanization}</span>
        <p className="text-sm">{targetEnglish}</p>
      </Card>
      <Button className="w-full rounded-full" onClick={() => onAnswered(true)}>
        I practiced
      </Button>
    </div>
  );
}
