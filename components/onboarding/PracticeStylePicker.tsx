"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, VolumeX, Keyboard, Headphones } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useSettingsStore } from "@/store/settings-store";
import { cn } from "@/lib/utils";
import type { PracticeMode } from "@/lib/generated/prisma/enums";

const OPTIONS: {
  mode: PracticeMode;
  title: string;
  description: string;
  icon: typeof Mic;
}[] = [
  {
    mode: "FULL_SPEAKING",
    title: "I want to speak out loud",
    description: "Use the microphone whenever it's offered.",
    icon: Mic,
  },
  {
    mode: "QUIET",
    title: "I usually study quietly",
    description: "Typing, tiles, and listening instead of the mic.",
    icon: VolumeX,
  },
  {
    mode: "TYPING_ONLY",
    title: "I mostly want typing practice",
    description: "Favor typed answers over tapping tiles.",
    icon: Keyboard,
  },
  {
    mode: "LISTENING_ONLY",
    title: "I mostly want listening practice",
    description: "Favor audio and comprehension over production.",
    icon: Headphones,
  },
];

export function PracticeStylePicker() {
  const router = useRouter();
  const setPracticeMode = useSettingsStore((s) => s.setPracticeMode);
  const [pending, setPending] = useState<PracticeMode | null>(null);

  async function choose(mode: PracticeMode) {
    setPending(mode);
    await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ practiceMode: mode }),
    });
    setPracticeMode(mode);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {OPTIONS.map((opt) => (
        <Card
          key={opt.mode}
          role="button"
          onClick={() => !pending && choose(opt.mode)}
          className={cn(
            "flex cursor-pointer flex-col items-start gap-3 rounded-3xl p-5 transition-colors hover:border-primary/50",
            pending === opt.mode && "border-primary bg-primary/5",
            pending && pending !== opt.mode && "opacity-50",
          )}
        >
          <div className="rounded-full bg-primary/10 p-2.5 text-primary">
            <opt.icon className="size-5" />
          </div>
          <div>
            <p className="font-medium">{opt.title}</p>
            <p className="text-sm text-muted-foreground">{opt.description}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
