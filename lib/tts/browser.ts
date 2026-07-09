"use client";

/** Always-available client-side fallback: the browser's Web Speech API. */
export function speakWithBrowser(text: string, rate = 1) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = rate;
  window.speechSynthesis.speak(utterance);
}

export function isBrowserTtsAvailable() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}
