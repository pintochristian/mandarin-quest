"use client";

import type { PracticeMode } from "@/lib/generated/prisma/enums";

export async function patchSettings(body: {
  practiceMode?: PracticeMode;
  audioSpeed?: number;
  showPinyin?: boolean;
  showEnglish?: boolean;
  speakingSensitivity?: number;
}) {
  await fetch("/api/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
