"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { reportMistake } from "@/lib/mistakes-client";
import type { FillBlankData } from "@/lib/validation/content";

export function FillBlankExercise({
  exerciseId,
  prompt,
  data,
  onAnswered,
}: {
  exerciseId: string;
  prompt: string;
  data: FillBlankData;
  onAnswered: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [parts0, parts1] = data.sentenceTemplate.split("___");

  return (
    <div className="space-y-4">
      <p className="text-center text-sm font-medium text-muted-foreground">{prompt}</p>
      <Card className="flex items-center justify-center rounded-2xl p-8 text-center">
        <p className="font-zh text-2xl">
          {parts0}
          <span className="mx-1 inline-block min-w-10 border-b-2 border-dashed border-primary align-baseline">
            {selected ?? " "}
          </span>
          {parts1}
        </p>
      </Card>
      <div className="flex flex-wrap justify-center gap-2">
        {(data.choices ?? []).map((choice) => {
          const showState = selected !== null;
          const isCorrect = choice === data.correctAnswer;
          const isSelected = choice === selected;
          return (
            <button
              key={choice}
              type="button"
              disabled={showState}
              onClick={() => {
                setSelected(choice);
                if (!isCorrect) {
                  reportMistake(exerciseId, {
                    kind: "FILL_BLANK",
                    selected: choice,
                    correct: data.correctAnswer,
                  });
                }
                onAnswered(isCorrect);
              }}
              className={cn(
                "font-zh rounded-full border px-5 py-2 text-lg font-medium transition-colors",
                showState &&
                  isCorrect &&
                  "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950",
                showState &&
                  isSelected &&
                  !isCorrect &&
                  "border-destructive bg-destructive/10 text-destructive",
                !showState && "border-border hover:border-primary/50",
              )}
            >
              {choice}
            </button>
          );
        })}
      </div>
    </div>
  );
}
