"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AudioButton } from "@/components/lesson/AudioButton";
import type { LessonDetail } from "@/lib/types/lesson";

export function DialogueBreakdownStep({
  dialogue,
  onContinue,
}: {
  dialogue: LessonDetail["dialogues"][number];
  onContinue: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <div className="space-y-1 text-center">
        <p className="text-sm font-medium text-primary">Breaking it down</p>
        <h2 className="text-2xl font-semibold tracking-tight">Line by line</h2>
        <p className="text-sm text-muted-foreground">
          Every sentence in the conversation, fully translated.
        </p>
      </div>

      <div className="space-y-3">
        {dialogue.lines.map((line, i) => (
          <Card key={i} className="rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <span className="mt-1 shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                {line.speaker}
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-zh text-lg">{line.script}</span>
                  <span className="text-sm text-muted-foreground">
                    {line.romanization}
                  </span>
                </div>
                <p className="text-sm">{line.english}</p>
              </div>
              <AudioButton text={line.script} size="sm" />
            </div>
          </Card>
        ))}
      </div>

      <Button size="lg" className="w-full rounded-full" onClick={onContinue}>
        Continue to exercises
      </Button>
    </div>
  );
}
