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
  const [romanizationParts0, romanizationParts1] =
    data.sentenceTemplateRomanization.split("___");
  const selectedChoice = data.choices?.find((c) => c.text === selected);

  return (
    <div className="space-y-4">
      <p className="text-center text-sm font-medium text-muted-foreground">{prompt}</p>
      <Card className="flex flex-col items-center justify-center gap-1 rounded-2xl p-8 text-center">
        <p className="font-zh text-2xl">
          {parts0}
          <span className="mx-1 inline-block min-w-10 border-b-2 border-dashed border-primary align-baseline">
            {selected ?? " "}
          </span>
          {parts1}
        </p>
        <p className="text-sm text-muted-foreground">
          {romanizationParts0}
          <span className="mx-1 inline-block min-w-10 align-baseline">
            {selectedChoice?.romanization ?? "___"}
          </span>
          {romanizationParts1}
        </p>
      </Card>
      <div className="flex flex-wrap justify-center gap-2">
        {(data.choices ?? []).map((choice) => {
          const showState = selected !== null;
          const isCorrect = choice.text === data.correctAnswer;
          const isSelected = choice.text === selected;
          return (
            <button
              key={choice.text}
              type="button"
              disabled={showState}
              onClick={() => {
                setSelected(choice.text);
                if (!isCorrect) {
                  reportMistake(exerciseId, {
                    kind: "FILL_BLANK",
                    selected: choice.text,
                    correct: data.correctAnswer,
                  });
                }
                onAnswered(isCorrect);
              }}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-2xl border px-5 py-2 transition-colors",
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
              <span className="font-zh text-lg font-medium">{choice.text}</span>
              <span className="text-xs text-muted-foreground">{choice.romanization}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
