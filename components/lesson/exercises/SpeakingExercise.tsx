"use client";

import { useEffect, useState } from "react";
import { Shuffle } from "lucide-react";
import { resolveInteractionMode } from "@/lib/interaction-mode";
import { useSettingsStore } from "@/store/settings-store";
import { isSpeechRecognitionSupported } from "@/lib/speech/useSpeechRecognition";
import type { InteractionMode } from "@/lib/generated/prisma/enums";
import type { SpeakingData } from "@/lib/validation/content";
import { TileAssemblyMode } from "@/components/lesson/exercises/speaking-modes/TileAssemblyMode";
import { TypePinyinMode } from "@/components/lesson/exercises/speaking-modes/TypePinyinMode";
import { DialogueChoiceMode } from "@/components/lesson/exercises/speaking-modes/DialogueChoiceMode";
import { ShadowListenMode } from "@/components/lesson/exercises/speaking-modes/ShadowListenMode";
import { AiTextChatMode } from "@/components/lesson/exercises/speaking-modes/AiTextChatMode";
import { MicSpeakingMode } from "@/components/lesson/exercises/speaking-modes/MicSpeakingMode";

const MODE_LABEL: Record<InteractionMode, string> = {
  MIC_SPEAKING: "Speak it",
  TYPE_PINYIN: "Type pinyin",
  TYPE_ENGLISH_GUIDED: "Build from English",
  WORD_TILE_SELECT: "Word tiles",
  SENTENCE_REORDER: "Reorder words",
  DIALOGUE_CHOICE: "Pick the response",
  SHADOW_LISTEN: "Listen along",
  AI_TEXT_CHAT: "AI chat",
};

export function SpeakingExercise({
  exerciseId,
  prompt,
  data,
  supportedModes,
  onAnswered,
}: {
  exerciseId: string;
  prompt: string;
  data: SpeakingData;
  supportedModes: InteractionMode[];
  onAnswered: (correct: boolean) => void;
}) {
  const practiceMode = useSettingsStore((s) => s.practiceMode);

  // Starts false on both server and first client render (no window on the
  // server) so there's no hydration mismatch; flips true right after mount
  // if the browser actually supports speech recognition.
  const [micAvailable, setMicAvailable] = useState(false);
  useEffect(() => {
    setMicAvailable(isSpeechRecognitionSupported());
  }, []);

  const [manualMode, setManualMode] = useState<InteractionMode | null>(null);
  const mode =
    manualMode ?? resolveInteractionMode(practiceMode, supportedModes, micAvailable);

  const switchableModes = supportedModes.filter(
    (m) => m !== mode && (m !== "MIC_SPEAKING" || micAvailable),
  );

  return (
    <div className="space-y-3">
      <p className="text-center text-sm font-medium text-muted-foreground">{prompt}</p>

      {mode === "TYPE_PINYIN" && (
        <TypePinyinMode
          instructions={data.targetEnglish}
          targetEnglish={data.targetEnglish}
          acceptablePinyin={data.acceptablePinyin}
          onAnswered={onAnswered}
        />
      )}
      {mode === "WORD_TILE_SELECT" && (
        <TileAssemblyMode
          exerciseId={exerciseId}
          instructions={`Build: "${data.targetEnglish}"`}
          tokens={data.tokens}
          distractorTokens={data.distractorTokens}
          onAnswered={onAnswered}
        />
      )}
      {mode === "SENTENCE_REORDER" && (
        <TileAssemblyMode
          exerciseId={exerciseId}
          instructions="Put the words in the right order."
          tokens={data.tokens}
          onAnswered={onAnswered}
        />
      )}
      {mode === "TYPE_ENGLISH_GUIDED" && (
        <TileAssemblyMode
          exerciseId={exerciseId}
          instructions={data.englishPrompt}
          tokens={data.tokens}
          distractorTokens={data.distractorTokens}
          onAnswered={onAnswered}
        />
      )}
      {mode === "DIALOGUE_CHOICE" && (
        <DialogueChoiceMode
          exerciseId={exerciseId}
          instructions={`Choose how to respond: "${data.targetEnglish}"`}
          options={data.dialogueChoiceOptions}
          onAnswered={onAnswered}
        />
      )}
      {mode === "SHADOW_LISTEN" && (
        <ShadowListenMode
          targetScript={data.targetScript}
          targetRomanization={data.targetRomanization}
          targetEnglish={data.targetEnglish}
          onAnswered={onAnswered}
        />
      )}
      {mode === "AI_TEXT_CHAT" && (
        <AiTextChatMode scenario={data.aiScenarioPrompt} onAnswered={onAnswered} />
      )}
      {mode === "MIC_SPEAKING" && (
        <MicSpeakingMode
          exerciseId={exerciseId}
          targetScript={data.targetScript}
          targetRomanization={data.targetRomanization}
          onAnswered={onAnswered}
        />
      )}

      {switchableModes.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 pt-1">
          {switchableModes.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setManualMode(m)}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-muted-foreground hover:text-primary"
            >
              <Shuffle className="size-3" />
              Try: {MODE_LABEL[m]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
