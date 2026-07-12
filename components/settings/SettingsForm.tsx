"use client";

import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettingsStore } from "@/store/settings-store";
import { patchSettings } from "@/lib/settings-client";
import type { PracticeMode } from "@/lib/generated/prisma/enums";

const PRACTICE_MODE_OPTIONS: { value: PracticeMode; label: string }[] = [
  { value: "FULL_SPEAKING", label: "Full Speaking" },
  { value: "QUIET", label: "Quiet" },
  { value: "TYPING_ONLY", label: "Typing-only" },
  { value: "LISTENING_ONLY", label: "Listening-only" },
];

export function SettingsForm({ aiProviderConfigured }: { aiProviderConfigured: boolean }) {
  const { theme, setTheme } = useTheme();
  const practiceMode = useSettingsStore((s) => s.practiceMode);
  const setPracticeMode = useSettingsStore((s) => s.setPracticeMode);
  const showPinyin = useSettingsStore((s) => s.showPinyin);
  const setShowPinyin = useSettingsStore((s) => s.setShowPinyin);
  const showEnglish = useSettingsStore((s) => s.showEnglish);
  const setShowEnglish = useSettingsStore((s) => s.setShowEnglish);
  const audioSpeed = useSettingsStore((s) => s.audioSpeed);
  const setAudioSpeed = useSettingsStore((s) => s.setAudioSpeed);
  const speakingSensitivity = useSettingsStore((s) => s.speakingSensitivity);
  const setSpeakingSensitivity = useSettingsStore((s) => s.setSpeakingSensitivity);
  const aiEnabled = useSettingsStore((s) => s.aiEnabled);
  const setAiEnabled = useSettingsStore((s) => s.setAiEnabled);

  return (
    <div className="space-y-4">
      <Card className="space-y-3 rounded-2xl p-4">
        <Label>Practice mode</Label>
        <Select
          value={practiceMode}
          onValueChange={(v) => {
            const mode = v as PracticeMode;
            setPracticeMode(mode);
            patchSettings({ practiceMode: mode });
          }}
        >
          <SelectTrigger className="w-full rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRACTICE_MODE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      <Card className="space-y-3 rounded-2xl p-4">
        <Label>Appearance</Label>
        <Select value={theme} onValueChange={setTheme}>
          <SelectTrigger className="w-full rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      <Card className="flex-row items-center justify-between rounded-2xl p-4">
        <div>
          <Label htmlFor="pinyin">Show pinyin</Label>
          <p className="text-sm text-muted-foreground">Romanization under characters</p>
        </div>
        <Switch
          id="pinyin"
          checked={showPinyin}
          onCheckedChange={(checked) => {
            setShowPinyin(checked);
            patchSettings({ showPinyin: checked });
          }}
        />
      </Card>

      <Card className="flex-row items-center justify-between rounded-2xl p-4">
        <div>
          <Label htmlFor="english">Show English</Label>
          <p className="text-sm text-muted-foreground">Translation alongside Mandarin</p>
        </div>
        <Switch
          id="english"
          checked={showEnglish}
          onCheckedChange={(checked) => {
            setShowEnglish(checked);
            patchSettings({ showEnglish: checked });
          }}
        />
      </Card>

      <Card className="space-y-3 rounded-2xl p-4">
        <div className="flex justify-between">
          <Label>Audio speed</Label>
          <span className="text-sm text-muted-foreground">{audioSpeed.toFixed(1)}x</span>
        </div>
        <Slider
          min={0.5}
          max={2}
          step={0.1}
          value={[audioSpeed]}
          onValueChange={([v]) => setAudioSpeed(v)}
          onValueCommit={([v]) => patchSettings({ audioSpeed: v })}
        />
      </Card>

      <Card className="space-y-3 rounded-2xl p-4">
        <div className="flex justify-between">
          <Label>Speaking sensitivity</Label>
          <span className="text-sm text-muted-foreground">
            {Math.round(speakingSensitivity * 100)}%
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Higher sensitivity requires a closer match to pass speaking exercises.
        </p>
        <Slider
          min={0}
          max={1}
          step={0.05}
          value={[speakingSensitivity]}
          onValueChange={([v]) => setSpeakingSensitivity(v)}
          onValueCommit={([v]) => patchSettings({ speakingSensitivity: v })}
        />
      </Card>

      <Card className="flex-row items-center justify-between rounded-2xl p-4">
        <div>
          <Label htmlFor="ai-enabled">AI features</Label>
          <p className="text-sm text-muted-foreground">
            {aiProviderConfigured
              ? "AI conversation practice and chat, in addition to the core course."
              : "No AI provider is connected on this deployment — turning this on won't do anything yet."}
          </p>
        </div>
        <Switch
          id="ai-enabled"
          checked={aiEnabled}
          onCheckedChange={(checked) => {
            setAiEnabled(checked);
            patchSettings({ aiEnabled: checked });
          }}
        />
      </Card>
    </div>
  );
}
