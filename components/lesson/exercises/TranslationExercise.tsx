"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn, normalizeAnswer } from "@/lib/utils";
import { reportMistake } from "@/lib/mistakes-client";
import type { TranslationData } from "@/lib/validation/content";

export function TranslationExercise({
  exerciseId,
  prompt,
  data,
  onAnswered,
}: {
  exerciseId: string;
  prompt: string;
  data: TranslationData;
  onAnswered: (correct: boolean) => void;
}) {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);

  function check() {
    const candidates = [data.correctAnswer, ...data.acceptableAnswers].map(
      normalizeAnswer,
    );
    const isCorrect = candidates.includes(normalizeAnswer(value));
    setResult(isCorrect ? "correct" : "incorrect");
    if (!isCorrect) {
      reportMistake(exerciseId, {
        kind: "TRANSLATION",
        promptText: data.sourceText,
        submittedText: value,
        correctText: data.correctAnswer,
        sourceLang: data.sourceLang,
      });
    }
    onAnswered(isCorrect);
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-sm font-medium text-muted-foreground">{prompt}</p>
      <Card className="rounded-2xl p-6 text-center">
        <p className={cn("text-lg", data.sourceLang === "zh" && "font-zh")}>
          {data.sourceText}
        </p>
        {data.sourceTextRomanization && (
          <p className="mt-1 text-sm text-muted-foreground">
            {data.sourceTextRomanization}
          </p>
        )}
      </Card>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={result !== null}
        placeholder={
          data.sourceLang === "en" ? "Type it in Mandarin..." : "Type the English..."
        }
        className="font-zh rounded-xl text-center text-lg"
        onKeyDown={(e) => e.key === "Enter" && value.trim() && check()}
      />
      {result === "incorrect" && (
        <p className="text-center text-sm text-destructive">
          Correct answer: <span className="font-zh">{data.correctAnswer}</span>
          {data.correctAnswerRomanization && (
            <span className="block text-xs">{data.correctAnswerRomanization}</span>
          )}
        </p>
      )}
      {result === null ? (
        <Button className="w-full rounded-full" disabled={!value.trim()} onClick={check}>
          Check
        </Button>
      ) : (
        <p
          className={cn(
            "text-center text-sm font-medium",
            result === "correct" ? "text-emerald-600" : "text-destructive",
          )}
        >
          {result === "correct" ? "Correct!" : "Not quite — keep going."}
        </p>
      )}
    </div>
  );
}
