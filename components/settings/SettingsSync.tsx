"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/store/settings-store";

/**
 * Hydrates the client settings store from the server on first load. A
 * no-op (silent) on public pages where the user isn't signed in yet.
 */
export function SettingsSync() {
  const hydrate = useSettingsStore((s) => s.hydrate);
  const hydrated = useSettingsStore((s) => s.hydrated);

  useEffect(() => {
    if (hydrated) return;
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.settings) {
          hydrate({
            practiceMode: data.settings.practiceMode,
            audioSpeed: data.settings.audioSpeed,
            showPinyin: data.settings.showPinyin,
            showEnglish: data.settings.showEnglish,
            speakingSensitivity: data.settings.speakingSensitivity,
            aiEnabled: data.settings.aiEnabled,
          });
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
