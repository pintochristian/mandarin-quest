"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AudioButton } from "@/components/lesson/AudioButton";
import { useSettingsStore } from "@/store/settings-store";
import type { LessonDetail } from "@/lib/types/lesson";

export function VocabularyStep({
  vocabulary,
  onContinue,
}: {
  vocabulary: LessonDetail["lessonVocabulary"];
  onContinue: () => void;
}) {
  const showPinyin = useSettingsStore((s) => s.showPinyin);
  const showEnglish = useSettingsStore((s) => s.showEnglish);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <div className="space-y-1 text-center">
        <p className="text-sm font-medium text-primary">New words</p>
        <h2 className="text-2xl font-semibold tracking-tight">
          {vocabulary.length} words for this lesson
        </h2>
        <p className="text-sm text-muted-foreground">
          Tap the speaker to hear each word.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {vocabulary.map(({ vocabularyItem: v }) => (
          <Card key={v.id} className="flex-row items-center gap-3 rounded-2xl p-4">
            <AudioButton text={v.script} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-zh text-xl">{v.script}</span>
                {showPinyin && (
                  <span className="text-sm text-muted-foreground">{v.romanization}</span>
                )}
              </div>
              {showEnglish && (
                <p className="text-sm text-muted-foreground">{v.english}</p>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Button size="lg" className="w-full rounded-full" onClick={onContinue}>
        Continue
      </Button>
    </div>
  );
}
