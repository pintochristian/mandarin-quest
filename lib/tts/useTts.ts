"use client";

import { useCallback, useRef } from "react";
import { speakWithBrowser } from "@/lib/tts/browser";

// Once we learn no premium provider is configured, stop hitting the route.
let premiumKnownUnavailable = false;

export function useTts() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(async (text: string, rate = 1) => {
    if (premiumKnownUnavailable) {
      speakWithBrowser(text, rate);
      return;
    }

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (res.status === 501) {
        premiumKnownUnavailable = true;
        speakWithBrowser(text, rate);
        return;
      }
      if (!res.ok) throw new Error("TTS request failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      audioRef.current?.pause();
      const audio = new Audio(url);
      audio.playbackRate = rate;
      audioRef.current = audio;
      await audio.play();
      audio.addEventListener("ended", () => URL.revokeObjectURL(url), { once: true });
    } catch {
      speakWithBrowser(text, rate);
    }
  }, []);

  return { speak };
}
