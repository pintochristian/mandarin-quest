"use client";

import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AudioButton } from "@/components/lesson/AudioButton";
import { useSettingsStore } from "@/store/settings-store";
import { cn } from "@/lib/utils";
import type { WordBankCategory } from "@/lib/wordbank/categorize";
import type { WordBankEntry } from "@/lib/wordbank/getWordBank";

const CATEGORY_META: Record<
  WordBankCategory,
  { label: string; className: string }
> = {
  NEW: { label: "New", className: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200" },
  LEARNING: {
    label: "Learning",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  },
  WEAK: {
    label: "Weak",
    className: "bg-destructive/10 text-destructive",
  },
  FAMILIAR: {
    label: "Familiar",
    className: "bg-secondary text-secondary-foreground",
  },
  MASTERED: {
    label: "Mastered",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  },
};

const CATEGORY_FILTERS: { value: WordBankCategory | "ALL" | "RECENT"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "WEAK", label: "Weak" },
  { value: "RECENT", label: "Recent" },
  { value: "MASTERED", label: "Mastered" },
];

function relativeReview(nextReviewAt: Date): string {
  const days = Math.round((nextReviewAt.getTime() - Date.now()) / 86_400_000);
  if (days <= 0) return "Due now";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

export function WordBankView({ entries }: { entries: WordBankEntry[] }) {
  const [filter, setFilter] = useState<(typeof CATEGORY_FILTERS)[number]["value"]>("ALL");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const showPinyin = useSettingsStore((s) => s.showPinyin);
  const showEnglish = useSettingsStore((s) => s.showEnglish);

  const levels = useMemo(() => {
    const set = new Set<number>();
    for (const e of entries) if (e.introducedIn) set.add(e.introducedIn.levelIndex);
    return [...set].sort((a, b) => a - b);
  }, [entries]);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (filter === "WEAK" && e.category !== "WEAK") return false;
      if (filter === "MASTERED" && e.category !== "MASTERED") return false;
      if (filter === "RECENT" && e.category !== "NEW" && e.category !== "LEARNING") return false;
      if (levelFilter !== "ALL" && String(e.introducedIn?.levelIndex) !== levelFilter) {
        return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const haystack = `${e.script} ${e.romanization} ${e.english}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [entries, filter, levelFilter, search]);

  if (entries.length === 0) {
    return (
      <Card className="rounded-3xl p-6 text-center text-sm text-muted-foreground">
        Words you learn through lessons will show up here automatically.
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search words..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="rounded-xl"
      />

      <div className="flex flex-wrap gap-2">
        {CATEGORY_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              filter === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/70",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {levels.length > 1 && (
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-full rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All levels</SelectItem>
            {levels.map((l) => (
              <SelectItem key={l} value={String(l)}>
                Level {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <p className="text-xs text-muted-foreground">
        {filtered.length} word{filtered.length === 1 ? "" : "s"}
      </p>

      <div className="space-y-2">
        {filtered.map((entry) => (
          <Card key={entry.nodeId} className="space-y-2 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <AudioButton text={entry.script} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-zh text-lg">{entry.script}</span>
                  {showPinyin && (
                    <span className="text-sm text-muted-foreground">{entry.romanization}</span>
                  )}
                </div>
                {showEnglish && <p className="text-sm text-muted-foreground">{entry.english}</p>}
              </div>
              <Badge className={CATEGORY_META[entry.category].className}>
                {CATEGORY_META[entry.category].label}
              </Badge>
            </div>

            {entry.exampleSentence && (
              <p className="rounded-xl bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
                {entry.exampleSentence.script}
                {showPinyin && ` · ${entry.exampleSentence.romanization}`}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>{Math.round(entry.masteryScore * 100)}% mastery</span>
              <span>{relativeReview(entry.nextReviewAt)}</span>
              {entry.introducedIn && (
                <span>from {entry.introducedIn.lessonTitle}</span>
              )}
              {entry.practiceCount > 0 && (
                <span>
                  {entry.practiceCount} practice{entry.practiceCount === 1 ? "" : "s"}
                  {entry.recentAccuracy !== null &&
                    ` · ${Math.round(entry.recentAccuracy * 100)}% accurate`}
                </span>
              )}
              {entry.hasRecurringMistake && (
                <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="size-3" />
                  Common mistake
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
