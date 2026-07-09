"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { reportMistake } from "@/lib/mistakes-client";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function TileAssemblyMode({
  exerciseId,
  instructions,
  tokens,
  distractorTokens = [],
  onAnswered,
}: {
  exerciseId: string;
  instructions: string;
  tokens: string[];
  distractorTokens?: string[];
  onAnswered: (correct: boolean) => void;
}) {
  const bank = useMemo(
    () => shuffle([...tokens, ...distractorTokens]),
    [tokens, distractorTokens],
  );
  const [used, setUsed] = useState<number[]>([]);
  const [checked, setChecked] = useState<boolean | null>(null);

  const built = used.map((i) => bank[i]);

  function check() {
    const isCorrect =
      built.length === tokens.length && built.every((t, i) => t === tokens[i]);
    setChecked(isCorrect);
    if (!isCorrect) {
      reportMistake(exerciseId, { kind: "SENTENCE_ORDER", submitted: built, correct: tokens });
    }
    onAnswered(isCorrect);
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-sm font-medium text-muted-foreground">
        {instructions}
      </p>

      <Card className="flex-row min-h-16 flex-wrap items-center gap-2 rounded-2xl p-4">
        {built.length === 0 && (
          <span className="text-sm text-muted-foreground">
            Tap words below to build your answer
          </span>
        )}
        {built.map((tok, i) => (
          <button
            key={i}
            type="button"
            disabled={checked !== null}
            onClick={() => setUsed((u) => u.filter((_, idx) => idx !== i))}
            className="font-zh rounded-lg bg-primary/10 px-3 py-1.5 text-lg text-primary"
          >
            {tok}
          </button>
        ))}
      </Card>

      <div className="flex flex-wrap justify-center gap-2">
        {bank.map((tok, i) => {
          const isUsed = used.includes(i);
          return (
            <button
              key={i}
              type="button"
              disabled={isUsed || checked !== null}
              onClick={() => setUsed((u) => [...u, i])}
              className={cn(
                "font-zh rounded-lg border px-3 py-1.5 text-lg transition-opacity",
                isUsed ? "opacity-0" : "border-border hover:border-primary/50",
              )}
            >
              {tok}
            </button>
          );
        })}
      </div>

      {checked === null ? (
        <Button
          className="w-full rounded-full"
          disabled={built.length === 0}
          onClick={check}
        >
          Check
        </Button>
      ) : (
        <p
          className={cn(
            "text-center text-sm font-medium",
            checked ? "text-emerald-600" : "text-destructive",
          )}
        >
          {checked ? "Correct!" : "Not quite — the order matters here."}
        </p>
      )}
    </div>
  );
}
