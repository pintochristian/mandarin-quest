"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { AudioButton } from "@/components/lesson/AudioButton";
import { useTts } from "@/lib/tts/useTts";
import { cn } from "@/lib/utils";
import { reportMistake } from "@/lib/mistakes-client";
import type { ListeningData } from "@/lib/validation/content";

export function ListeningExercise({
  exerciseId,
  prompt,
  data,
  onAnswered,
}: {
  exerciseId: string;
  prompt: string;
  data: ListeningData;
  onAnswered: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const { speak } = useTts();

  useEffect(() => {
    speak(data.audioScript);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <p className="text-center text-sm font-medium text-muted-foreground">{prompt}</p>
      <Card className="flex flex-col items-center gap-3 rounded-2xl p-8">
        <AudioButton text={data.audioScript} className="size-14" />
        <p className="text-xs text-muted-foreground">Tap to listen again</p>
      </Card>
      <div className="grid grid-cols-1 gap-2">
        {data.options.map((opt, i) => {
          const isSelected = selected === i;
          const showState = selected !== null;
          return (
            <button
              key={i}
              type="button"
              disabled={showState}
              onClick={() => {
                setSelected(i);
                if (!opt.isCorrect) {
                  const correct = data.options.find((o) => o.isCorrect);
                  if (correct) {
                    reportMistake(exerciseId, {
                      kind: "LISTENING",
                      selectedText: opt.text,
                      correctText: correct.text,
                    });
                  }
                }
                onAnswered(opt.isCorrect);
              }}
              className={cn(
                "rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-colors",
                showState &&
                  opt.isCorrect &&
                  "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950",
                showState &&
                  isSelected &&
                  !opt.isCorrect &&
                  "border-destructive bg-destructive/10 text-destructive",
                !showState && "border-border hover:border-primary/50",
              )}
            >
              {opt.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
