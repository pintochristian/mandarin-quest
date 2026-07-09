"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { reportMistake } from "@/lib/mistakes-client";
import type { SpeakingData } from "@/lib/validation/content";

export function DialogueChoiceMode({
  exerciseId,
  instructions,
  options,
  onAnswered,
}: {
  exerciseId: string;
  instructions: string;
  options: SpeakingData["dialogueChoiceOptions"];
  onAnswered: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <p className="text-center text-sm font-medium text-muted-foreground">
        {instructions}
      </p>
      <div className="space-y-2">
        {options.map((opt, i) => {
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
                  const correct = options.find((o) => o.isCorrect);
                  if (correct) {
                    reportMistake(exerciseId, {
                      kind: "DIALOGUE_CHOICE",
                      selectedText: opt.script,
                      correctText: correct.script,
                    });
                  }
                }
                onAnswered(opt.isCorrect);
              }}
              className={cn(
                "flex w-full items-baseline gap-2 rounded-2xl border px-4 py-3 text-left transition-colors",
                showState &&
                  opt.isCorrect &&
                  "border-emerald-500 bg-emerald-50 dark:bg-emerald-950",
                showState &&
                  isSelected &&
                  !opt.isCorrect &&
                  "border-destructive bg-destructive/10",
                !showState && "border-border hover:border-primary/50",
              )}
            >
              <span className="font-zh text-lg">{opt.script}</span>
              <span className="text-sm text-muted-foreground">{opt.english}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
