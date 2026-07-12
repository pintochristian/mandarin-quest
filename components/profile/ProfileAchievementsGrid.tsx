import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { AchievementIcon } from "@/components/profile/AchievementIcon";
import { cn } from "@/lib/utils";

export async function ProfileAchievementsGrid({ userId }: { userId: string }) {
  const [allAchievements, earned] = await Promise.all([
    db.achievement.findMany(),
    db.userAchievement.findMany({ where: { userId }, select: { achievementId: true } }),
  ]);
  const earnedIds = new Set(earned.map((e) => e.achievementId));

  return (
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
                className={cn("size-6", isEarned ? "text-primary" : "text-muted-foreground")}
              />
              <span className="text-xs font-medium">{a.title}</span>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
