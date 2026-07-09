"use client";

import { useEffect, useState } from "react";
import { PartyPopper } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AchievementIcon } from "@/components/profile/AchievementIcon";

type CompleteResult = {
  xpEarned: number;
  enrolledCount: number;
  languageProfile: { xp: number; streak: number };
  newAchievements: { code: string; title: string; description: string; icon: string }[];
};

export function SrsEnrollmentStep({
  lessonId,
  score,
  onFinish,
}: {
  lessonId: string;
  score: number;
  onFinish: () => void;
}) {
  const [result, setResult] = useState<CompleteResult | null>(null);

  useEffect(() => {
    fetch(`/api/lessons/${lessonId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score }),
    })
      .then((r) => r.json())
      .then(setResult);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-6 text-center">
      <PartyPopper className="size-12 text-primary" />
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Lesson complete!</h2>
        <p className="text-sm text-muted-foreground">Score: {score}%</p>
      </div>

      {result ? (
        <>
          <Card className="w-full space-y-3 rounded-3xl p-6">
            <Row label="XP earned" value={`+${result.xpEarned}`} />
            <Row
              label="Words & grammar added to review"
              value={`${result.enrolledCount}`}
            />
            <Row
              label="Current streak"
              value={`${result.languageProfile.streak} day${result.languageProfile.streak === 1 ? "" : "s"}`}
            />
          </Card>
          {result.newAchievements.length > 0 && (
            <div className="w-full space-y-2">
              <p className="text-sm font-medium text-primary">New achievement!</p>
              {result.newAchievements.map((a) => (
                <Card
                  key={a.code}
                  className="flex-row items-center gap-3 rounded-2xl border-primary/30 bg-primary/5 p-3 text-left"
                >
                  <AchievementIcon icon={a.icon} className="size-6 text-primary" />
                  <div>
                    <p className="font-medium">{a.title}</p>
                    <p className="text-sm text-muted-foreground">{a.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <Skeleton className="h-32 w-full rounded-3xl" />
      )}

      <Button
        size="lg"
        className="w-full rounded-full"
        disabled={!result}
        onClick={onFinish}
      >
        Done
      </Button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
