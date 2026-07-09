"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AudioButton } from "@/components/lesson/AudioButton";
import { useSettingsStore } from "@/store/settings-store";
import { cn } from "@/lib/utils";
import type { LessonDetail } from "@/lib/types/lesson";

export function DialogueStep({
  dialogue,
  onContinue,
}: {
  dialogue: LessonDetail["dialogues"][number];
  onContinue: () => void;
}) {
  const showPinyin = useSettingsStore((s) => s.showPinyin);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <div className="space-y-1 text-center">
        <p className="text-sm font-medium text-primary">Listen first</p>
        <h2 className="text-2xl font-semibold tracking-tight">{dialogue.title}</h2>
        <p className="text-sm text-muted-foreground">
          Read and listen to the whole conversation. Tap a line to see the English.
        </p>
      </div>

      <div className="space-y-2">
        {dialogue.lines.map((line, i) => {
          const isRevealed = revealed.has(i);
          return (
            <Card
              key={i}
              role="button"
              tabIndex={0}
              onClick={() =>
                setRevealed((prev) => {
                  const next = new Set(prev);
                  if (next.has(i)) {
                    next.delete(i);
                  } else {
                    next.add(i);
                  }
                  return next;
                })
              }
              className="cursor-pointer rounded-2xl p-4 transition-colors hover:border-primary/40"
            >
              <div className="flex items-start gap-3">
                <span className="mt-1 shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                  {line.speaker}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-zh text-lg">{line.script}</span>
                    {showPinyin && (
                      <span className="text-sm text-muted-foreground">
                        {line.romanization}
                      </span>
                    )}
                  </div>
                  <p
                    className={cn(
                      "text-sm text-muted-foreground transition-opacity",
                      isRevealed ? "opacity-100" : "opacity-0 select-none",
                    )}
                  >
                    {line.english}
                  </p>
                </div>
                <AudioButton text={line.script} size="sm" />
              </div>
            </Card>
          );
        })}
      </div>

      <Button size="lg" className="w-full rounded-full" onClick={onContinue}>
        Continue
      </Button>
    </div>
  );
}
