"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// ChatWindow pulls in useSpeechRecognition (Web Speech API wiring) and is
// only reached on the AI-conversation lesson step / speaking-mode exercise,
// never on the initial lesson-step render — keep it out of the lesson
// route's initial bundle.
export const ChatWindowLazy = dynamic(
  () => import("@/components/ai-tutor/ChatWindow").then((m) => m.ChatWindow),
  { ssr: false, loading: () => <Skeleton className="h-72 w-full" /> },
);
