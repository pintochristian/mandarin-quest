"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { createRng, seededShuffle } from "@/lib/practice/seededRandom";
import type { MatchPair } from "@/lib/practice/synthesize";

/**
 * Tap-to-match: pick one Chinese word and one English meaning; a correct
 * pair locks in green, a wrong pair flashes red and both deselect. Calls
 * onPairMatched once per correct pair (so the caller can log one
 * PracticeAttempt per word) and onComplete once every pair is matched.
 */
export function MatchPairsQuestion({
  pairs,
  onPairMatched,
  onComplete,
}: {
  pairs: MatchPair[];
  onPairMatched: (nodeId: string, correct: boolean) => void;
  onComplete: () => void;
}) {
  const [scriptOrder] = useState(() => seededShuffle(pairs, createRng("match:script")));
  const [meaningOrder] = useState(() => seededShuffle(pairs, createRng("match:meaning")));
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [selectedScript, setSelectedScript] = useState<string | null>(null);
  const [selectedMeaning, setSelectedMeaning] = useState<string | null>(null);
  const [wrongFlash, setWrongFlash] = useState<{ script: string; meaning: string } | null>(null);

  const allMatched = matched.size === pairs.length;
  useEffect(() => {
    if (allMatched && matched.size > 0) onComplete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMatched]);

  const remainingHint = useMemo(
    () => pairs.length - matched.size,
    [pairs.length, matched.size],
  );

  function tryMatch(scriptNodeId: string | null, meaningNodeId: string | null) {
    if (!scriptNodeId || !meaningNodeId) return;
    const correct = scriptNodeId === meaningNodeId;
    onPairMatched(scriptNodeId, correct);
    if (correct) {
      setMatched((m) => new Set(m).add(scriptNodeId));
      setSelectedScript(null);
      setSelectedMeaning(null);
    } else {
      setWrongFlash({ script: scriptNodeId, meaning: meaningNodeId });
      setTimeout(() => {
        setWrongFlash(null);
        setSelectedScript(null);
        setSelectedMeaning(null);
      }, 500);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-center text-sm font-medium text-muted-foreground">
        Match each word with its meaning ({remainingHint} left)
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {scriptOrder.map((pair) => {
            const isMatched = matched.has(pair.nodeId);
            const isSelected = selectedScript === pair.nodeId;
            const isWrong = wrongFlash?.script === pair.nodeId;
            return (
              <button
                key={pair.nodeId}
                type="button"
                disabled={isMatched}
                onClick={() => {
                  setSelectedScript(pair.nodeId);
                  tryMatch(pair.nodeId, selectedMeaning);
                }}
                className={cn(
                  "w-full rounded-xl border px-3 py-2 text-center transition-colors",
                  isMatched && "border-emerald-500 bg-emerald-50 opacity-50 dark:bg-emerald-950",
                  isWrong && "border-destructive bg-destructive/10",
                  isSelected && !isMatched && !isWrong && "border-primary bg-primary/10",
                  !isMatched && !isSelected && !isWrong && "border-border hover:border-primary/50",
                )}
              >
                <span className="font-zh text-lg">{pair.script}</span>
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          {meaningOrder.map((pair) => {
            const isMatched = matched.has(pair.nodeId);
            const isSelected = selectedMeaning === pair.nodeId;
            const isWrong = wrongFlash?.meaning === pair.nodeId;
            return (
              <button
                key={pair.nodeId}
                type="button"
                disabled={isMatched}
                onClick={() => {
                  setSelectedMeaning(pair.nodeId);
                  tryMatch(selectedScript, pair.nodeId);
                }}
                className={cn(
                  "w-full rounded-xl border px-3 py-2 text-center text-sm transition-colors",
                  isMatched && "border-emerald-500 bg-emerald-50 opacity-50 dark:bg-emerald-950",
                  isWrong && "border-destructive bg-destructive/10",
                  isSelected && !isMatched && !isWrong && "border-primary bg-primary/10",
                  !isMatched && !isSelected && !isWrong && "border-border hover:border-primary/50",
                )}
              >
                {pair.english}
              </button>
            );
          })}
        </div>
      </div>
      {allMatched && (
        <Card className="rounded-xl p-3 text-center text-sm text-emerald-600 dark:text-emerald-400">
          All matched!
        </Card>
      )}
    </div>
  );
}
