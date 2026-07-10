"use client";

import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ExerciseRenderer } from "@/components/lesson/exercises/ExerciseRenderer";
import type { ExerciseRecord } from "@/lib/types/lesson";

export function ExercisesStep({
  exercises,
  onComplete,
}: {
  exercises: ExerciseRecord[];
  onComplete: (score: number) => void;
}) {
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredThisRound, setAnsweredThisRound] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);

  const exercise = exercises[index];
  const progressPct = Math.round((index / exercises.length) * 100);

  function advance(correct: boolean) {
    if (index + 1 < exercises.length) {
      setIndex((i) => i + 1);
      setAnsweredThisRound(false);
      setLastAnswerCorrect(null);
    } else {
      const finalCorrect = correct ? correctCount + 1 : correctCount;
      const score = Math.round((finalCorrect / exercises.length) * 100);
      onComplete(score);
    }
  }

  function handleAnswered(correct: boolean) {
    if (answeredThisRound) return;
    setAnsweredThisRound(true);
    setLastAnswerCorrect(correct);
    if (correct) setCorrectCount((c) => c + 1);

    // A mistake stays on screen — the learner reads the explanation and
    // taps Continue whenever they're ready, instead of getting swept to
    // the next exercise. A correct answer still advances quickly since
    // there's nothing to read.
    if (correct) {
      setTimeout(() => advance(true), 500);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <div className="space-y-2">
        <Progress value={progressPct} className="h-2" />
        <p className="text-center text-xs text-muted-foreground">
          Exercise {index + 1} of {exercises.length}
        </p>
      </div>

      <ExerciseRenderer
        key={exercise.id}
        exercise={exercise}
        onAnswered={handleAnswered}
      />

      {answeredThisRound && lastAnswerCorrect === false && (
        <Button size="lg" className="w-full rounded-full" onClick={() => advance(false)}>
          Continue
        </Button>
      )}
    </div>
  );
}
