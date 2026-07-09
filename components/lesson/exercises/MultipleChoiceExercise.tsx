"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { AudioButton } from "@/components/lesson/AudioButton";
import { cn } from "@/lib/utils";
import { reportMistake } from "@/lib/mistakes-client";
import type { MultipleChoiceData } from "@/lib/validation/content";

export function MultipleChoiceExercise({
  exerciseId,
  prompt,
  data,
  onAnswered,
}: {
  exerciseId: string;
  prompt: string;
  data: MultipleChoiceData;
  onAnswered: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <p className="text-center text-sm font-medium text-muted-foreground">{prompt}</p>
      {data.questionScript && (
        <Card className="flex-row items-center justify-center gap-3 rounded-2xl p-6 text-center">
          <AudioButton text={data.questionScript} />
          <div>
            <p className="font-zh text-2xl">{data.questionScript}</p>
            {data.questionRomanization && (
              <p className="text-sm text-muted-foreground">{data.questionRomanization}</p>
            )}
          </div>
        </Card>
      )}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
                      kind: "MULTIPLE_CHOICE",
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
