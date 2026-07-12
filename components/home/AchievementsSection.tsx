import { db } from "@/lib/db";
import { AchievementIcon } from "@/components/profile/AchievementIcon";

export async function AchievementsSection({ userId }: { userId: string }) {
  const earnedAchievements = await db.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
    orderBy: { earnedAt: "desc" },
    take: 6,
  });

  if (earnedAchievements.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Achievements</p>
      <div className="flex flex-wrap gap-3">
        {earnedAchievements.map((ua) => (
          <div
            key={ua.id}
            className="flex flex-col items-center gap-1 rounded-2xl bg-secondary/60 px-3 py-2 text-center"
            title={ua.achievement.description}
          >
            <AchievementIcon icon={ua.achievement.icon} className="size-5 text-primary" />
            <span className="text-[11px] text-muted-foreground">{ua.achievement.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
