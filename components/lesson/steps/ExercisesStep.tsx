"use client";

import { useState } from "react";
import { Progress } from "@/components/ui/progress";
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

  const exercise = exercises[index];
  const progressPct = Math.round((index / exercises.length) * 100);

  function handleAnswered(correct: boolean) {
    if (answeredThisRound) return;
    setAnsweredThisRound(true);
    if (correct) setCorrectCount((c) => c + 1);

    setTimeout(
      () => {
        if (index + 1 < exercises.length) {
          setIndex((i) => i + 1);
          setAnsweredThisRound(false);
        } else {
          const finalCorrect = correct ? correctCount + 1 : correctCount;
          const score = Math.round((finalCorrect / exercises.length) * 100);
          onComplete(score);
        }
      },
      correct ? 500 : 1400,
    );
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
    </div>
  );
}
