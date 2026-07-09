"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AudioButton } from "@/components/lesson/AudioButton";
import { CheckCircle2 } from "lucide-react";

type DueItem = {
  id: string;
  prompt: { script: string; romanization: string; english: string };
};

export function ReviewStep({ onContinue }: { onContinue: () => void }) {
  const [items, setItems] = useState<DueItem[] | null>(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    fetch("/api/review/queue")
      .then((r) => r.json())
      .then((data) => setItems(data.items.slice(0, 5)));
  }, []);

  if (items === null) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
        <Skeleton className="h-8 w-40 self-center" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-6 text-center">
        <CheckCircle2 className="size-12 text-primary" />
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            You&rsquo;re all caught up
          </h2>
          <p className="text-sm text-muted-foreground">
            Nothing due for review — let&rsquo;s learn something new.
          </p>
        </div>
        <Button size="lg" className="w-full max-w-xs rounded-full" onClick={onContinue}>
          Start lesson
        </Button>
      </div>
    );
  }

  const current = items[index];

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <div className="space-y-1 text-center">
        <p className="text-sm font-medium text-primary">Quick review</p>
        <h2 className="text-2xl font-semibold tracking-tight">
          {index + 1} of {items.length}
        </h2>
      </div>

      <Card
        role="button"
        onClick={() => setRevealed(true)}
        className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-3xl p-8 text-center"
      >
        <AudioButton text={current.prompt.script} />
        <span className="font-zh text-3xl">{current.prompt.script}</span>
        <span className="text-muted-foreground">{current.prompt.romanization}</span>
        {revealed && <p className="mt-2 text-lg">{current.prompt.english}</p>}
        {!revealed && <p className="text-xs text-muted-foreground">Tap to reveal</p>}
      </Card>

      <Button
        size="lg"
        className="w-full rounded-full"
        disabled={!revealed}
        onClick={() => {
          if (index + 1 < items.length) {
            setIndex((i) => i + 1);
            setRevealed(false);
          } else {
            onContinue();
          }
        }}
      >
        {index + 1 < items.length ? "Next" : "Start lesson"}
      </Button>
    </div>
  );
}
