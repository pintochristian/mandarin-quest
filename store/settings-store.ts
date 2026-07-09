import { create } from "zustand";
import type { PracticeMode } from "@/lib/generated/prisma/enums";

/**
 * Client-side mirror of the signed-in user's UserSettings row. Hydrated
 * from the server on load (components/settings/SettingsSync.tsx) — NOT
 * persisted to localStorage, since settings are per-account and this app
 * can have multiple users on one device/browser.
 */
type SettingsState = {
  practiceMode: PracticeMode;
  showPinyin: boolean;
  showEnglish: boolean;
  audioSpeed: number;
  speakingSensitivity: number;
  hydrated: boolean;
  setPracticeMode: (mode: PracticeMode) => void;
  setShowPinyin: (show: boolean) => void;
  setShowEnglish: (show: boolean) => void;
  setAudioSpeed: (speed: number) => void;
  setSpeakingSensitivity: (value: number) => void;
  hydrate: (settings: Partial<Omit<SettingsState, "hydrate" | "hydrated">>) => void;
};

export const useSettingsStore = create<SettingsState>()((set) => ({
  practiceMode: "FULL_SPEAKING",
  showPinyin: true,
  showEnglish: true,
  audioSpeed: 1,
  speakingSensitivity: 0.5,
  hydrated: false,
  setPracticeMode: (mode) => set({ practiceMode: mode }),
  setShowPinyin: (show) => set({ showPinyin: show }),
  setShowEnglish: (show) => set({ showEnglish: show }),
  setAudioSpeed: (speed) => set({ audioSpeed: speed }),
  setSpeakingSensitivity: (value) => set({ speakingSensitivity: value }),
  hydrate: (settings) => set({ ...settings, hydrated: true }),
}));
