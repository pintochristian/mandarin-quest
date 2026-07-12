"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Only one InteractionMode renders at a time in SpeakingExercise, but all
// mode components were statically imported there, so every learner's bundle
// carried the mic/speech-recognition code even in Quiet/Typing-only mode.
export const MicSpeakingModeLazy = dynamic(
  () => import("@/components/lesson/exercises/speaking-modes/MicSpeakingMode").then((m) => m.MicSpeakingMode),
  { ssr: false, loading: () => <Skeleton className="h-48 w-full" /> },
);
