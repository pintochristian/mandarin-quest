"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PartyPopper } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExerciseRenderer } from "@/components/lesson/exercises/ExerciseRenderer";
import { MatchPairsQuestion } from "@/components/practice/MatchPairsQuestion";
import type { PracticeQuestion } from "@/lib/practice/synthesize";

type PracticeSource =
  | { kind: "ALL" }
  | { kind: "WEAK" }
  | { kind: "RECENT" }
  | { kind: "MASTERED" }
  | { kind: "MISTAKES" }
  | { kind: "LEVEL"; levelIndex: number }
  | { kind: "CUSTOM"; nodeIds: string[] };

const SOURCE_OPTIONS: { value: string; label: string; source: PracticeSource }[] = [
  { value: "ALL", label: "Everything I've learned", source: { kind: "ALL" } },
  { value: "WEAK", label: "Weak words", source: { kind: "WEAK" } },
  { value: "RECENT", label: "Recently learned", source: { kind: "RECENT" } },
  { value: "MASTERED", label: "Mastered (maintenance)", source: { kind: "MASTERED" } },
  { value: "MISTAKES", label: "My recent mistakes", source: { kind: "MISTAKES" } },
];

const LENGTH_OPTIONS = [5, 10, 20] as const;

type Phase = "config" | "running" | "empty" | "complete";

export function PracticeConfigurator({ levels }: { levels: { index: number; title: string }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customNodeIds = searchParams.get("nodeIds")?.split(",").filter(Boolean) ?? [];
  const isCustom = customNodeIds.length > 0;

  const [phase, setPhase] = useState<Phase>("config");
  const [sourceValue, setSourceValue] = useState(isCustom ? "CUSTOM" : "ALL");
  const [levelIndex, setLevelIndex] = useState<number | null>(levels[0]?.index ?? null);
  const [length, setLength] = useState<number>(10);
  const [endless, setEndless] = useState(false);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredThisRound, setAnsweredThisRound] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [startedAt, setStartedAt] = useState(Date.now());

  function resolveSource(): PracticeSource {
    if (sourceValue === "CUSTOM") return { kind: "CUSTOM", nodeIds: customNodeIds };
    if (sourceValue === "LEVEL" && levelIndex !== null) {
      return { kind: "LEVEL", levelIndex };
    }
    return SOURCE_OPTIONS.find((o) => o.value === sourceValue)?.source ?? { kind: "ALL" };
  }

  async function fetchSession(len: number): Promise<{ sessionId: string; questions: PracticeQuestion[] }> {
    const res = await fetch("/api/practice/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: resolveSource(), length: len }),
    });
    return res.json();
  }

  async function start() {
    const data = await fetchSession(endless ? 10 : length);
    if (data.questions.length === 0) {
      setPhase("empty");
      return;
    }
    setSessionId(data.sessionId);
    setQuestions(data.questions);
    setIndex(0);
    setCorrectCount(0);
    setAnsweredThisRound(false);
    setLastCorrect(null);
    setStartedAt(Date.now());
    setPhase("running");
  }

  async function loadMore() {
    if (!sessionId || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch("/api/practice/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: resolveSource(), length: 10 }),
      });
      const data: { questions: PracticeQuestion[] } = await res.json();
      setQuestions((qs) => [...qs, ...data.questions]);
    } finally {
      setLoadingMore(false);
    }
  }

  function advance() {
    const nextIndex = index + 1;
    if (endless) {
      if (nextIndex >= questions.length - 2) loadMore();
      if (nextIndex >= questions.length) return; // waiting on loadMore
      setIndex(nextIndex);
      setAnsweredThisRound(false);
      setLastCorrect(null);
      setStartedAt(Date.now());
      return;
    }
    if (nextIndex < questions.length) {
      setIndex(nextIndex);
      setAnsweredThisRound(false);
      setLastCorrect(null);
      setStartedAt(Date.now());
    } else {
      setPhase("complete");
    }
  }

  function logAttempt(nodeId: string, mode: string, correct: boolean) {
    if (!sessionId) return;
    fetch("/api/practice/attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        nodeId,
        mode,
        correct,
        responseTimeMs: Date.now() - startedAt,
      }),
    }).catch(() => {});
  }

  function handleAnswered(correct: boolean) {
    if (answeredThisRound) return;
    setAnsweredThisRound(true);
    setLastCorrect(correct);
    if (correct) setCorrectCount((c) => c + 1);

    const current = questions[index];
    if (current && current.kind === "exercise") {
      logAttempt(current.nodeId, current.mode, correct);
    }

    if (correct) setTimeout(() => advance(), 500);
  }

  function handleMatchPairAttempt(nodeId: string, correct: boolean) {
    logAttempt(nodeId, "MATCH_PAIRS", correct);
  }

  function handleMatchComplete() {
    if (answeredThisRound) return;
    setAnsweredThisRound(true);
    setLastCorrect(true);
    setCorrectCount((c) => c + 1);
    setTimeout(() => advance(), 500);
  }

  if (phase === "config") {
    return (
      <div className="space-y-4">
        <Card className="space-y-3 rounded-2xl p-4">
          <p className="text-sm font-medium">What do you want to practice?</p>
          {isCustom ? (
            <div className="flex items-center justify-between rounded-xl border px-3 py-2">
              <span className="text-sm">
                {customNodeIds.length} selected word{customNodeIds.length === 1 ? "" : "s"}
              </span>
              <button
                type="button"
                className="text-xs text-primary underline"
                onClick={() => {
                  setSourceValue("ALL");
                  router.replace("/practice");
                }}
              >
                Change
              </button>
            </div>
          ) : (
            <Select
              value={sourceValue}
              onValueChange={(v) => {
                setSourceValue(v);
              }}
            >
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
                {levels.length > 0 && <SelectItem value="LEVEL">A specific level</SelectItem>}
              </SelectContent>
            </Select>
          )}

          {!isCustom && sourceValue === "LEVEL" && levels.length > 0 && (
            <Select
              value={String(levelIndex ?? levels[0].index)}
              onValueChange={(v) => setLevelIndex(Number(v))}
            >
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {levels.map((l) => (
                  <SelectItem key={l.index} value={String(l.index)}>
                    {l.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </Card>

        <Card className="space-y-3 rounded-2xl p-4">
          <p className="text-sm font-medium">Session length</p>
          <div className="flex flex-wrap gap-2">
            {LENGTH_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  setLength(n);
                  setEndless(false);
                }}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  !endless && length === n
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setEndless(true)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                endless
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
              }`}
            >
              Endless
            </button>
          </div>
        </Card>

        <Button size="lg" className="w-full rounded-full" onClick={start}>
          Start practicing
        </Button>
      </div>
    );
  }

  if (phase === "empty") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <p className="text-lg font-semibold">Nothing to practice here yet</p>
        <p className="text-sm text-muted-foreground">
          Complete a lesson first, or try a different source.
        </p>
        <Button className="rounded-full" onClick={() => setPhase("config")}>
          Choose a different source
        </Button>
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <PartyPopper className="size-12 text-primary" />
        <p className="text-2xl font-semibold tracking-tight">Nice work!</p>
        <p className="text-sm text-muted-foreground">
          {correctCount}/{questions.length} correct
        </p>
        <div className="flex w-full max-w-xs flex-col gap-2">
          <Button className="rounded-full" onClick={() => setPhase("config")}>
            Practice again
          </Button>
          <Button variant="outline" className="rounded-full" onClick={() => router.push("/")}>
            Back home
          </Button>
        </div>
      </div>
    );
  }

  // running
  const current = questions[index];
  if (!current) {
    return <p className="text-center text-sm text-muted-foreground">Loading more questions...</p>;
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <p className="text-center text-xs text-muted-foreground">
        {endless ? `Question ${index + 1}` : `Question ${index + 1} of ${questions.length}`}
      </p>
      {current.kind === "exercise" ? (
        <ExerciseRenderer
          key={current.exerciseRecord.id}
          exercise={current.exerciseRecord}
          onAnswered={handleAnswered}
        />
      ) : (
        <MatchPairsQuestion
          key={current.pairs.map((p) => p.nodeId).join(",")}
          pairs={current.pairs}
          onPairMatched={handleMatchPairAttempt}
          onComplete={handleMatchComplete}
        />
      )}
      {answeredThisRound && lastCorrect === false && (
        <Button size="lg" className="w-full rounded-full" onClick={() => advance()}>
          Continue
        </Button>
      )}
    </div>
  );
}
