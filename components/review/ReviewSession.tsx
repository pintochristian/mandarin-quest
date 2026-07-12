"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PartyPopper, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { AudioButton } from "@/components/lesson/AudioButton";
import { cn } from "@/lib/utils";

type DueItem = {
  id: string;
  prompt: { script: string; romanization: string; english: string };
};

const GRADES: { label: string; quality: number; className: string }[] = [
  {
    label: "Again",
    quality: 1,
    className: "bg-destructive/10 text-destructive hover:bg-destructive/20",
  },
  {
    label: "Hard",
    quality: 3,
    className:
      "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-200",
  },
  {
    label: "Good",
    quality: 4,
    className:
      "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-200",
  },
  {
    label: "Easy",
    quality: 5,
    className: "bg-primary/10 text-primary hover:bg-primary/20",
  },
];

export function ReviewSession() {
  const router = useRouter();
  const [items, setItems] = useState<DueItem[] | null>(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [startedAt, setStartedAt] = useState(Date.now());

  useEffect(() => {
    fetch("/api/review/queue")
      .then((r) => r.json())
      .then((data) => setItems(data.items));
  }, []);

  if (items === null) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-8">
        <Skeleton className="h-8 w-40 self-center" />
        <Skeleton className="h-48 w-full rounded-3xl" />
      </div>
    );
  }

  if (items.length === 0 || index >= items.length) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center justify-center gap-6 px-4 text-center">
        <PartyPopper className="size-12 text-primary" />
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {items.length === 0 ? "Nothing due right now" : "Daily review complete."}
          </h1>
          <p className="text-sm text-muted-foreground">
            {items.length === 0
              ? "Keep practising anytime."
              : `You reviewed ${items.length} item${items.length === 1 ? "" : "s"}. Keep practising anytime.`}
          </p>
        </div>
        <div className="flex w-full max-w-xs flex-col gap-2">
          <Button size="lg" className="w-full rounded-full" onClick={() => router.push("/practice")}>
            Practice Anytime
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full rounded-full"
            onClick={() => router.push("/")}
          >
            Back home
          </Button>
        </div>
      </div>
    );
  }

  const current = items[index];

  async function grade(quality: number) {
    const responseTimeMs = Date.now() - startedAt;
    await fetch("/api/review/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewItemId: current.id, quality, responseTimeMs }),
    });
    setIndex((i) => i + 1);
    setRevealed(false);
    setStartedAt(Date.now());
  }

  const progressPct = Math.round((index / items.length) * 100);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center gap-3 border-b px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => router.push("/")}
        >
          <X className="size-5" />
        </Button>
        <Progress value={progressPct} className="h-2 flex-1" />
        <span className="shrink-0 text-xs text-muted-foreground">
          {index + 1}/{items.length}
        </span>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-6 px-4 py-8">
        <Card
          role="button"
          onClick={() => setRevealed(true)}
          className={cn(
            "flex min-h-56 flex-col items-center justify-center gap-3 rounded-3xl p-8 text-center",
            !revealed && "cursor-pointer",
          )}
        >
          <AudioButton text={current.prompt.script} />
          <span className="font-zh text-4xl">{current.prompt.script}</span>
          <span className="text-muted-foreground">{current.prompt.romanization}</span>
          {revealed ? (
            <p className="mt-2 text-lg">{current.prompt.english}</p>
          ) : (
            <p className="text-xs text-muted-foreground">Tap to reveal</p>
          )}
        </Card>

        {revealed ? (
          <div className="grid grid-cols-4 gap-2">
            {GRADES.map((g) => (
              <button
                key={g.label}
                type="button"
                onClick={() => grade(g.quality)}
                className={cn(
                  "rounded-2xl px-2 py-3 text-sm font-semibold transition-colors",
                  g.className,
                )}
              >
                {g.label}
              </button>
            ))}
          </div>
        ) : (
          <Button
            size="lg"
            className="w-full rounded-full"
            onClick={() => setRevealed(true)}
          >
            Show answer
          </Button>
        )}
      </main>
    </div>
  );
}
