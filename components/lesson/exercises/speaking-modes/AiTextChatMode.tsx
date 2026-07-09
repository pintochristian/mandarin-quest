"use client";

import { Button } from "@/components/ui/button";
import { ChatWindow } from "@/components/ai-tutor/ChatWindow";

export function AiTextChatMode({
  scenario,
  onAnswered,
}: {
  scenario: string;
  onAnswered: (correct: boolean) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-center text-sm font-medium text-muted-foreground">
        AI conversation practice
      </p>
      <ChatWindow openingPrompt={scenario} />
      <Button className="w-full rounded-full" onClick={() => onAnswered(true)}>
        Continue
      </Button>
    </div>
  );
}
