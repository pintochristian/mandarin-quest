"use client";

import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTts } from "@/lib/tts/useTts";
import { useSettingsStore } from "@/store/settings-store";
import { cn } from "@/lib/utils";

export function AudioButton({
  text,
  size = "icon",
  className,
}: {
  text: string;
  size?: "icon" | "sm";
  className?: string;
}) {
  const audioSpeed = useSettingsStore((s) => s.audioSpeed);
  const { speak } = useTts();

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      className={cn("shrink-0 rounded-full", size === "sm" && "size-8", className)}
      onClick={(e) => {
        e.stopPropagation();
        speak(text, audioSpeed);
      }}
      aria-label={`Play audio for ${text}`}
    >
      <Volume2 className="size-4" />
    </Button>
  );
}
