"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

type FilterValue = "ALL" | WordBankCategory | "RECENT";
const RECENT_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

const CATEGORY_FILTERS: { value: FilterValue; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "NEW", label: "New" },
  { value: "LEARNING", label: "Learning" },
  { value: "WEAK", label: "Weak" },
  { value: "FAMILIAR", label: "Familiar" },
  { value: "MASTERED", label: "Mastered" },
  { value: "RECENT", label: "Recently learned" },
];

const PAGE_SIZE = 30;

function relativeReview(nextReviewAt: Date): string {
  const days = Math.round((nextReviewAt.getTime() - Date.now()) / 86_400_000);
  if (days <= 0) return "Due now";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

function relativePast(date: Date): string {
  const days = Math.round((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export function WordBankView({ entries }: { entries: WordBankEntry[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterValue>("ALL");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [moduleFilter, setModuleFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const showPinyin = useSettingsStore((s) => s.showPinyin);
  const showEnglish = useSettingsStore((s) => s.showEnglish);

  const levels = useMemo(() => {
    const set = new Set<number>();
    for (const e of entries) if (e.introducedIn) set.add(e.introducedIn.levelIndex);
    return [...set].sort((a, b) => a - b);
  }, [entries]);

  const modules = useMemo(() => {
    const map = new Map<string, { id: string; title: string; levelIndex: number }>();
    for (const e of entries) {
      if (e.introducedIn) {
        map.set(e.introducedIn.moduleId, {
          id: e.introducedIn.moduleId,
          title: e.introducedIn.moduleTitle,
          levelIndex: e.introducedIn.levelIndex,
        });
      }
    }
    return [...map.values()].sort((a, b) => a.levelIndex - b.levelIndex);
  }, [entries]);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (filter === "RECENT") {
        if (Date.now() - e.enrolledAt.getTime() > RECENT_WINDOW_MS) return false;
      } else if (filter !== "ALL" && e.category !== filter) {
        return false;
      }
      if (levelFilter !== "ALL" && String(e.introducedIn?.levelIndex) !== levelFilter) {
        return false;
      }
      if (moduleFilter !== "ALL" && e.introducedIn?.moduleId !== moduleFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const haystack = `${e.script} ${e.romanization} ${e.english}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [entries, filter, levelFilter, moduleFilter, search]);

  const visible = filtered.slice(0, visibleCount);

  function toggleSelected(nodeId: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }

  function startCustomPractice() {
    const ids = [...selected].join(",");
    router.push(`/practice?nodeIds=${encodeURIComponent(ids)}`);
  }

  if (entries.length === 0) {
    return (
      <Card className="rounded-3xl p-6 text-center text-sm text-muted-foreground">
        Words you learn through lessons will show up here automatically.
      </Card>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <Input
        placeholder="Search words..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setVisibleCount(PAGE_SIZE);
        }}
        className="rounded-xl"
      />

      <div className="flex flex-wrap gap-2">
        {CATEGORY_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => {
              setFilter(f.value);
              setVisibleCount(PAGE_SIZE);
            }}
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

      <div className="grid grid-cols-2 gap-2">
        {levels.length > 1 && (
          <Select
            value={levelFilter}
            onValueChange={(v) => {
              setLevelFilter(v);
              setModuleFilter("ALL");
              setVisibleCount(PAGE_SIZE);
            }}
          >
            <SelectTrigger className="rounded-xl">
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
        {modules.length > 1 && (
          <Select
            value={moduleFilter}
            onValueChange={(v) => {
              setModuleFilter(v);
              setVisibleCount(PAGE_SIZE);
            }}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All modules</SelectItem>
              {modules
                .filter((m) => levelFilter === "ALL" || String(m.levelIndex) === levelFilter)
                .map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.title}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} word{filtered.length === 1 ? "" : "s"}
        {selected.size > 0 && ` · ${selected.size} selected`}
      </p>

      <div className="space-y-2">
        {visible.map((entry) => {
          const isSelected = selected.has(entry.nodeId);
          return (
            <Card
              key={entry.nodeId}
              role="button"
              onClick={() => toggleSelected(entry.nodeId)}
              className={cn(
                "space-y-2 rounded-2xl p-4 transition-colors",
                isSelected && "ring-2 ring-primary",
              )}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  aria-label={isSelected ? "Deselect word" : "Select word"}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelected(entry.nodeId);
                  }}
                  className={cn(
                    "mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border",
                  )}
                >
                  {isSelected && <Check className="size-3" />}
                </button>
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
                <span>
                  {entry.lastReviewedAt
                    ? `Last reviewed ${relativePast(entry.lastReviewedAt)}`
                    : "Never reviewed"}
                </span>
                <span>{relativeReview(entry.nextReviewAt)}</span>
                {entry.introducedIn && <span>from {entry.introducedIn.lessonTitle}</span>}
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
          );
        })}
      </div>

      {visibleCount < filtered.length && (
        <Button
          variant="outline"
          className="w-full rounded-full"
          onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
        >
          Show more ({filtered.length - visibleCount} remaining)
        </Button>
      )}

      {selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-2xl items-center gap-3">
            <p className="flex-1 text-sm text-muted-foreground">
              {selected.size} word{selected.size === 1 ? "" : "s"} selected
            </p>
            <Button variant="ghost" className="rounded-full" onClick={() => setSelected(new Set())}>
              Clear
            </Button>
            <Button className="rounded-full" onClick={startCustomPractice}>
              Practice selected
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
