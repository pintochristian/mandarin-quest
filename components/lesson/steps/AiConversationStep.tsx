"use client";

import { Button } from "@/components/ui/button";
import { ChatWindowLazy } from "@/components/ai-tutor/ChatWindowLazy";
import type { LessonDetail } from "@/lib/types/lesson";

export function AiConversationStep({
  lesson,
  onContinue,
}: {
  lesson: LessonDetail;
  onContinue: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-6">
      <div className="space-y-1 text-center">
        <p className="text-sm font-medium text-primary">Put it into practice</p>
        <h2 className="text-2xl font-semibold tracking-tight">AI Conversation</h2>
      </div>

      <ChatWindowLazy
        lessonId={lesson.id}
        openingPrompt={`Say hello and try out what you just learned about ${lesson.situationTag}.`}
      />

      <Button size="lg" className="w-full max-w-lg rounded-full" onClick={onContinue}>
        Continue
      </Button>
    </div>
  );
}
