"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettingsStore } from "@/store/settings-store";
import { patchSettings } from "@/lib/settings-client";
import { asExerciseRecords, type LessonDetail } from "@/lib/types/lesson";
import type { PracticeMode } from "@/lib/generated/prisma/enums";
import { ReviewStep } from "@/components/lesson/steps/ReviewStep";
import { GrammarStep } from "@/components/lesson/steps/GrammarStep";
import { VocabularyStep } from "@/components/lesson/steps/VocabularyStep";
import { DialogueStep } from "@/components/lesson/steps/DialogueStep";
import { DialogueBreakdownStep } from "@/components/lesson/steps/DialogueBreakdownStep";
import { ExercisesStep } from "@/components/lesson/steps/ExercisesStep";
import { AiConversationStep } from "@/components/lesson/steps/AiConversationStep";
import { SrsEnrollmentStep } from "@/components/lesson/steps/SrsEnrollmentStep";

const STEPS = [
  "REVIEW",
  "GRAMMAR",
  "VOCABULARY",
  "DIALOGUE",
  "DIALOGUE_BREAKDOWN",
  "EXERCISES",
  "AI_CONVERSATION",
  "SRS_ENROLLMENT",
] as const;

const PRACTICE_MODE_OPTIONS: { value: PracticeMode; label: string }[] = [
  { value: "FULL_SPEAKING", label: "Full Speaking" },
  { value: "QUIET", label: "Quiet" },
  { value: "TYPING_ONLY", label: "Typing-only" },
  { value: "LISTENING_ONLY", label: "Listening-only" },
];

export function LessonRunner({
  lesson,
  aiAvailable,
  skipReview = false,
}: {
  lesson: LessonDetail;
  aiAvailable: boolean;
  skipReview?: boolean;
}) {
  const router = useRouter();
  const exercises = asExerciseRecords(lesson);
  const dialogue = lesson.dialogues[0];

  // Steps whose content the lesson doesn't have are skipped rather than
  // shown blank — this mirrors the pre-existing AI_CONVERSATION skip and
  // is what lets `skipReview` land cleanly on the first real content step
  // instead of assuming GRAMMAR always applies.
  function firstValidStepFrom(index: number) {
    let n = index;
    while (
      n < STEPS.length - 1 &&
      ((STEPS[n] === "AI_CONVERSATION" && !aiAvailable) ||
        (STEPS[n] === "GRAMMAR" && !lesson.primaryGrammarConcept) ||
        ((STEPS[n] === "DIALOGUE" || STEPS[n] === "DIALOGUE_BREAKDOWN") && !dialogue))
    ) {
      n += 1;
    }
    return n;
  }

  const [stepIndex, setStepIndex] = useState(() =>
    skipReview ? firstValidStepFrom(1) : 0,
  );
  const [score, setScore] = useState(0);
  const practiceMode = useSettingsStore((s) => s.practiceMode);
  const setPracticeMode = useSettingsStore((s) => s.setPracticeMode);

  const step = STEPS[stepIndex];
  const progressPct = Math.round((stepIndex / (STEPS.length - 1)) * 100);

  function next() {
    setStepIndex((i) => Math.min(firstValidStepFrom(i + 1), STEPS.length - 1));
  }

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
        <Select
          value={practiceMode}
          onValueChange={(v) => {
            const mode = v as PracticeMode;
            setPracticeMode(mode);
            patchSettings({ practiceMode: mode });
          }}
        >
          <SelectTrigger size="sm" className="w-40 shrink-0 rounded-full text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRACTICE_MODE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        {step === "REVIEW" && <ReviewStep onContinue={next} />}
        {step === "GRAMMAR" && lesson.primaryGrammarConcept && (
          <GrammarStep grammar={lesson.primaryGrammarConcept} onContinue={next} />
        )}
        {step === "VOCABULARY" && (
          <VocabularyStep vocabulary={lesson.lessonVocabulary} onContinue={next} />
        )}
        {step === "DIALOGUE" && dialogue && (
          <DialogueStep dialogue={dialogue} onContinue={next} />
        )}
        {step === "DIALOGUE_BREAKDOWN" && dialogue && (
          <DialogueBreakdownStep dialogue={dialogue} onContinue={next} />
        )}
        {step === "EXERCISES" && (
          <ExercisesStep
            exercises={exercises}
            aiAvailable={aiAvailable}
            onComplete={(finalScore) => {
              setScore(finalScore);
              next();
            }}
          />
        )}
        {step === "AI_CONVERSATION" && aiAvailable && (
          <AiConversationStep lesson={lesson} onContinue={next} />
        )}
        {step === "SRS_ENROLLMENT" && (
          <SrsEnrollmentStep
            lessonId={lesson.id}
            score={score}
            onFinish={() => router.push("/")}
          />
        )}
      </main>
    </div>
  );
}
