import { db } from "@/lib/db";

export type AdminAnalytics = {
  userCount: number;
  lessonsCompletedCount: number;
  avgReviewQuality: number;
  completionTrend: { date: string; count: number }[];
  popularLessons: { lessonId: string; title: string; completions: number }[];
};

export async function getAnalytics(): Promise<AdminAnalytics> {
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
  fourteenDaysAgo.setHours(0, 0, 0, 0);

  const [
    userCount,
    lessonsCompletedCount,
    reviewLogs,
    recentCompletions,
    lessonCompletionCounts,
    lessons,
  ] = await Promise.all([
    db.user.count(),
    db.userLessonProgress.count({ where: { status: "COMPLETED" } }),
    db.userNodeMasteryLog.findMany({ select: { quality: true } }),
    db.userLessonProgress.findMany({
      where: { status: "COMPLETED", completedAt: { gte: fourteenDaysAgo } },
      select: { completedAt: true },
    }),
    db.userLessonProgress.groupBy({
      by: ["lessonId"],
      where: { status: "COMPLETED" },
      _count: { lessonId: true },
      orderBy: { _count: { lessonId: "desc" } },
      take: 5,
    }),
    db.lesson.findMany({ select: { id: true, title: true } }),
  ]);

  const avgReviewQuality =
    reviewLogs.length === 0
      ? 0
      : reviewLogs.reduce((sum, l) => sum + l.quality, 0) / reviewLogs.length;

  const trendByDay: Record<string, number> = {};
  for (let i = 0; i < 14; i++) {
    const d = new Date(fourteenDaysAgo);
    d.setDate(d.getDate() + i);
    trendByDay[d.toISOString().slice(0, 10)] = 0;
  }
  for (const c of recentCompletions) {
    if (!c.completedAt) continue;
    const key = c.completedAt.toISOString().slice(0, 10);
    if (key in trendByDay) trendByDay[key]++;
  }
  const completionTrend = Object.entries(trendByDay).map(([date, count]) => ({
    date,
    count,
  }));

  const lessonTitleById = new Map(lessons.map((l) => [l.id, l.title]));
  const popularLessons = lessonCompletionCounts.map((row) => ({
    lessonId: row.lessonId,
    title: lessonTitleById.get(row.lessonId) ?? "Unknown lesson",
    completions: row._count.lessonId,
  }));

  return {
    userCount,
    lessonsCompletedCount,
    avgReviewQuality,
    completionTrend,
    popularLessons,
  };
}
