import { db } from "@/lib/db";
import { getWorldMap } from "@/lib/world-map";

type Criteria =
  | { type: "LESSONS_COMPLETED"; count: number }
  | { type: "MODULES_UNLOCKED"; count: number }
  | { type: "STREAK_DAYS"; count: number }
  | { type: "WORDS_LEARNED"; count: number }
  | { type: "SPEAKING_ATTEMPTS"; count: number };

async function computeSignals(userId: string) {
  const [lessonsCompleted, worldMap, languageProfile, wordsLearned, speakingAttempts] =
    await Promise.all([
      db.userLessonProgress.count({ where: { userId, status: "COMPLETED" } }),
      getWorldMap(userId),
      db.userLanguageProfile.findFirst({ where: { userId } }),
      db.userNodeMastery.count({ where: { userId, node: { type: "VOCAB" } } }),
      db.speakingAttempt.count({ where: { userId } }),
    ]);

  const modulesUnlocked = worldMap.filter((m) => m.status !== "locked").length;

  return {
    LESSONS_COMPLETED: lessonsCompleted,
    MODULES_UNLOCKED: modulesUnlocked,
    STREAK_DAYS: languageProfile?.streak ?? 0,
    WORDS_LEARNED: wordsLearned,
    SPEAKING_ATTEMPTS: speakingAttempts,
  };
}

export type EarnedAchievement = {
  code: string;
  title: string;
  description: string;
  icon: string;
};

/** Awards any achievements the learner has newly earned. Safe to call after any progress-changing action — already-earned ones are skipped via the unique constraint. */
export async function checkAndAwardAchievements(
  userId: string,
): Promise<EarnedAchievement[]> {
  const [achievements, alreadyEarned, signals] = await Promise.all([
    db.achievement.findMany(),
    db.userAchievement.findMany({ where: { userId }, select: { achievementId: true } }),
    computeSignals(userId),
  ]);

  const earnedIds = new Set(alreadyEarned.map((a) => a.achievementId));
  const newlyEarned: EarnedAchievement[] = [];

  for (const achievement of achievements) {
    if (earnedIds.has(achievement.id)) continue;
    const criteria = achievement.criteria as unknown as Criteria;
    const value = signals[criteria.type];
    if (value >= criteria.count) {
      await db.userAchievement.create({
        data: { userId, achievementId: achievement.id },
      });
      newlyEarned.push({
        code: achievement.code,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
      });
    }
  }

  return newlyEarned;
}
