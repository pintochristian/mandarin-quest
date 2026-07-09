"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AudioButton } from "@/components/lesson/AudioButton";
import { useSettingsStore } from "@/store/settings-store";
import { cn } from "@/lib/utils";
import type { LessonDetail } from "@/lib/types/lesson";

export function GrammarStep({
  grammar,
  onContinue,
}: {
  grammar: NonNullable<LessonDetail["primaryGrammarConcept"]>;
  onContinue: () => void;
}) {
  const showPinyin = useSettingsStore((s) => s.showPinyin);
  const showEnglish = useSettingsStore((s) => s.showEnglish);
  const quiz = grammar.quiz ?? [];
  const [answers, setAnswers] = useState<Record<number, number | null>>({});

  const allCorrect =
    quiz.length === 0 || quiz.every((q, i) => answers[i] === q.correctIndex);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <div className="space-y-1 text-center">
        <p className="text-sm font-medium text-primary">Today&rsquo;s grammar</p>
        <h2 className="text-2xl font-semibold tracking-tight">{grammar.title}</h2>
      </div>

      <Card className="rounded-3xl border-none bg-secondary/60 p-5 text-[15px] leading-relaxed">
        {grammar.simpleExplanation}
      </Card>

      <div className="space-y-3">
        {grammar.visualExamples.map((ex, i) => (
          <Card key={i} className="flex-row items-center gap-3 rounded-2xl p-4">
            <AudioButton text={ex.script} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-zh text-lg">{ex.script}</span>
                {showPinyin && (
                  <span className="text-sm text-muted-foreground">{ex.romanization}</span>
                )}
              </div>
              {showEnglish && (
                <p className="text-sm text-muted-foreground">{ex.english}</p>
              )}
              {ex.note && <p className="mt-1 text-xs text-primary">{ex.note}</p>}
            </div>
          </Card>
        ))}
      </div>

      {quiz.length > 0 && (
        <div className="space-y-4">
          <p className="text-center text-sm font-medium text-muted-foreground">
            Quick check
          </p>
          {quiz.map((q, qi) => (
            <Card key={qi} className="space-y-3 rounded-2xl p-4">
              <p className="text-sm font-medium">{q.prompt}</p>
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt, oi) => {
                  const selected = answers[qi] === oi;
                  const isCorrect = oi === q.correctIndex;
                  const showState = answers[qi] !== undefined && answers[qi] !== null;
                  return (
                    <button
                      key={oi}
                      type="button"
                      onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                      className={cn(
                        "rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                        showState &&
                          selected &&
                          isCorrect &&
                          "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950",
                        showState &&
                          selected &&
                          !isCorrect &&
                          "border-destructive bg-destructive/10 text-destructive",
                        !(showState && selected) &&
                          "border-border hover:border-primary/50",
                      )}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}

      <motion.div whileTap={{ scale: 0.97 }}>
        <Button
          size="lg"
          className="w-full rounded-full"
          disabled={!allCorrect}
          onClick={onContinue}
        >
          Continue
        </Button>
      </motion.div>
    </div>
  );
}
