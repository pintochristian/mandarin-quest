"use client";

import { MultipleChoiceExercise } from "@/components/lesson/exercises/MultipleChoiceExercise";
import { ListeningExercise } from "@/components/lesson/exercises/ListeningExercise";
import { FillBlankExercise } from "@/components/lesson/exercises/FillBlankExercise";
import { TranslationExercise } from "@/components/lesson/exercises/TranslationExercise";
import { RapidReviewExercise } from "@/components/lesson/exercises/RapidReviewExercise";
import { SpeakingExercise } from "@/components/lesson/exercises/SpeakingExercise";
import { TileAssemblyMode } from "@/components/lesson/exercises/speaking-modes/TileAssemblyMode";
import type { ExerciseRecord } from "@/lib/types/lesson";

export function ExerciseRenderer({
  exercise,
  onAnswered,
}: {
  exercise: ExerciseRecord;
  onAnswered: (correct: boolean) => void;
}) {
  switch (exercise.type) {
    case "MULTIPLE_CHOICE":
    case "LISTENING_COMPREHENSION":
      return exercise.type === "MULTIPLE_CHOICE" ? (
        <MultipleChoiceExercise
          exerciseId={exercise.id}
          prompt={exercise.prompt}
          data={exercise.data}
          onAnswered={onAnswered}
        />
      ) : (
        <ListeningExercise
          exerciseId={exercise.id}
          prompt={exercise.prompt}
          data={{
            audioScript: exercise.data.audioScript,
            audioRomanization: exercise.data.audioRomanization,
            options: exercise.data.options,
          }}
          onAnswered={onAnswered}
        />
      );
    case "LISTENING":
      return (
        <ListeningExercise
          exerciseId={exercise.id}
          prompt={exercise.prompt}
          data={exercise.data}
          onAnswered={onAnswered}
        />
      );
    case "FILL_BLANK":
      return (
        <FillBlankExercise
          exerciseId={exercise.id}
          prompt={exercise.prompt}
          data={exercise.data}
          onAnswered={onAnswered}
        />
      );
    case "TRANSLATION":
      return (
        <TranslationExercise
          exerciseId={exercise.id}
          prompt={exercise.prompt}
          data={exercise.data}
          onAnswered={onAnswered}
        />
      );
    case "SENTENCE_ORDER":
      return (
        <TileAssemblyMode
          exerciseId={exercise.id}
          instructions={exercise.data.englishHint}
          tokens={exercise.data.tokens}
          onAnswered={onAnswered}
        />
      );
    case "RAPID_REVIEW":
      return (
        <RapidReviewExercise
          prompt={exercise.prompt}
          data={exercise.data}
          onAnswered={onAnswered}
        />
      );
    case "SPEAKING":
    case "CONVERSATION_SIM":
      return (
        <SpeakingExercise
          exerciseId={exercise.id}
          prompt={exercise.prompt}
          data={exercise.data}
          supportedModes={exercise.supportedModes}
          onAnswered={onAnswered}
        />
      );
  }
}
