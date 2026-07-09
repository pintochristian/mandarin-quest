"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AudioButton } from "@/components/lesson/AudioButton";
import type { RapidReviewData } from "@/lib/validation/content";

export function RapidReviewExercise({
  prompt,
  data,
  onAnswered,
}: {
  prompt: string;
  data: RapidReviewData;
  onAnswered: (correct: boolean) => void;
}) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const item = data.items[index];

  return (
    <div className="space-y-4">
      <p className="text-center text-sm font-medium text-muted-foreground">
        {prompt} ({index + 1}/{data.items.length})
      </p>
      <Card
        role="button"
        onClick={() => setRevealed(true)}
        className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-2xl p-8 text-center"
      >
        <AudioButton text={item.promptScript} />
        <span className="font-zh text-2xl">{item.promptScript}</span>
        <span className="text-sm text-muted-foreground">{item.promptRomanization}</span>
        {revealed && <p className="mt-1 text-base">{item.answerEnglish}</p>}
      </Card>
      <Button
        className="w-full rounded-full"
        disabled={!revealed}
        onClick={() => {
          if (index + 1 < data.items.length) {
            setIndex((i) => i + 1);
            setRevealed(false);
          } else {
            onAnswered(true);
          }
        }}
      >
        {index + 1 < data.items.length ? "Next" : "Done"}
      </Button>
    </div>
  );
}
