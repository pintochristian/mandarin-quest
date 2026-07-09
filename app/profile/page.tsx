import { db } from "@/lib/db";
import { requireOnboardedUserId } from "@/lib/session";
import { getUserStats, getMemoryScore } from "@/lib/stats";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MasteryRadar } from "@/components/profile/MasteryRadar";
import { AchievementIcon } from "@/components/profile/AchievementIcon";
import { BottomNav } from "@/components/nav/BottomNav";
import { cn } from "@/lib/utils";

export default async function ProfilePage() {
  const userId = await requireOnboardedUserId();

  const [languageProfile, stats, memoryScore, allAchievements, earned] = await Promise.all([
    db.userLanguageProfile.findFirst({ where: { userId } }),
    getUserStats(userId),
    getMemoryScore(userId),
    db.achievement.findMany(),
    db.userAchievement.findMany({ where: { userId }, select: { achievementId: true } }),
  ]);

  const earnedIds = new Set(earned.map((e) => e.achievementId));

  const radarData = [
    { metric: "Grammar", value: Math.round(stats.grammarMastery * 100) },
    { metric: "Vocabulary", value: Math.round(stats.vocabularyMastery * 100) },
    { metric: "Conversation", value: Math.round(stats.conversationMastery * 100) },
    { metric: "Pronunciation", value: Math.round(stats.pronunciationScore * 100) },
    { metric: "Listening", value: Math.round(stats.listeningMastery * 100) },
  ];

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10 pb-24">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Conversation level {languageProfile?.conversationLevel ?? 1}
        </p>
      </div>

      <Card className="space-y-3 rounded-3xl p-4">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-medium">Memory Score</p>
          <p className="text-2xl font-semibold text-primary">
            {Math.round(memoryScore.overall * 100)}%
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          How much of what you&rsquo;ve studied you likely still remember right now
          — this naturally drops if you fall behind on review.
        </p>
        <MemoryScoreBar label="Review health" value={memoryScore.reviewHealth} />
      </Card>

      <Card className="rounded-3xl p-4">
        <MasteryRadar data={radarData} />
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Current streak" value={`${languageProfile?.streak ?? 0} days`} />
        <StatCard
          label="Longest streak"
          value={`${languageProfile?.longestStreak ?? 0} days`}
        />
        <StatCard label="Words learned" value={`${stats.wordsLearned}`} />
        <StatCard
          label="Grammar rules mastered"
          value={`${stats.grammarRulesMastered}`}
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Achievements</p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {allAchievements.map((a) => {
            const isEarned = earnedIds.has(a.id);
            return (
              <Card
                key={a.id}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl p-3 text-center",
                  !isEarned && "opacity-40",
                )}
                title={a.description}
              >
                <AchievementIcon
                  icon={a.icon}
                  className={cn(
                    "size-6",
                    isEarned ? "text-primary" : "text-muted-foreground",
                  )}
                />
                <span className="text-xs font-medium">{a.title}</span>
              </Card>
            );
          })}
        </div>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="rounded-2xl p-4">
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </Card>
  );
}

function MemoryScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{Math.round(value * 100)}%</span>
      </div>
      <Progress value={value * 100} className="h-1.5" />
    </div>
  );
}
