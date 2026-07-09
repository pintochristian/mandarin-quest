import Link from "next/link";
import { BookOpen, RotateCcw, Flame, Star } from "lucide-react";
import { db } from "@/lib/db";
import { requireOnboardedUserId } from "@/lib/session";
import { countDueReviewItems } from "@/lib/srs/queue";
import { getNextLesson } from "@/lib/world-map";
import { getUserStats } from "@/lib/stats";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { AchievementIcon } from "@/components/profile/AchievementIcon";
import { BottomNav } from "@/components/nav/BottomNav";

export default async function Home() {
  const userId = await requireOnboardedUserId();

  const [languageProfile, dueCount, nextLesson, stats, earnedAchievements] =
    await Promise.all([
      db.userLanguageProfile.findFirst({ where: { userId } }),
      countDueReviewItems(userId),
      getNextLesson(userId),
      getUserStats(userId),
      db.userAchievement.findMany({
        where: { userId },
        include: { achievement: true },
        orderBy: { earnedAt: "desc" },
        take: 6,
      }),
    ]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-zh text-2xl text-primary">你好</span>
        </div>
        <SignOutButton />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatTile
          icon={<Flame className="size-5 text-primary" />}
          value={`${languageProfile?.streak ?? 0}`}
          label="Streak"
        />
        <StatTile
          icon={<Star className="size-5 text-primary" />}
          value={`${languageProfile?.xp ?? 0}`}
          label="XP"
        />
        <StatTile
          icon={<span className="font-zh text-lg text-primary">级</span>}
          value={`${languageProfile?.conversationLevel ?? 1}`}
          label="Level"
        />
      </div>

      {nextLesson && (
        <Link href={`/lesson/${nextLesson.id}`}>
          <Card className="flex-row items-center gap-4 rounded-2xl p-4 transition-colors hover:border-primary/50">
            <BookOpen className="size-6 text-primary" />
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase">
                {nextLesson.moduleTitle}
              </p>
              <p className="font-medium">{nextLesson.title}</p>
              <p className="text-sm text-muted-foreground">
                {nextLesson.reason ?? `${nextLesson.estimatedMinutes} min · continue learning`}
              </p>
            </div>
          </Card>
        </Link>
      )}

      <Link href="/review">
        <Card className="flex-row items-center gap-4 rounded-2xl border-primary/30 bg-primary/5 p-4 transition-colors hover:border-primary/60">
          <RotateCcw className="size-6 text-primary" />
          <div className="flex-1">
            <p className="font-medium">Review due today</p>
            <p className="text-sm text-muted-foreground">
              {dueCount > 0 ? `${dueCount} items ready` : "Nothing due right now"}
            </p>
          </div>
          {dueCount > 0 && <Badge>{dueCount}</Badge>}
        </Card>
      </Link>

      <Card className="space-y-4 rounded-2xl p-4">
        <p className="text-sm font-medium">Mastery</p>
        <MasteryBar label="Grammar" value={stats.grammarMastery} />
        <MasteryBar label="Vocabulary" value={stats.vocabularyMastery} />
        <MasteryBar label="Speaking" value={stats.pronunciationScore} />
      </Card>

      {earnedAchievements.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Achievements</p>
          <div className="flex flex-wrap gap-3">
            {earnedAchievements.map((ua) => (
              <div
                key={ua.id}
                className="flex flex-col items-center gap-1 rounded-2xl bg-secondary/60 px-3 py-2 text-center"
                title={ua.achievement.description}
              >
                <AchievementIcon
                  icon={ua.achievement.icon}
                  className="size-5 text-primary"
                />
                <span className="text-[11px] text-muted-foreground">
                  {ua.achievement.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <BottomNav active="home" />
    </main>
  );
}

function StatTile({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <Card className="flex flex-col items-center gap-1 rounded-2xl p-3">
      {icon}
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Card>
  );
}

function MasteryBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{Math.round(value * 100)}%</span>
      </div>
      <Progress value={value * 100} className="h-2" />
    </div>
  );
}
