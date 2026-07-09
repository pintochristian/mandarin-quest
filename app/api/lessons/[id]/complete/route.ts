import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/session";
import { enrollLessonReviewItems } from "@/lib/srs/queue";
import { checkAndAwardAchievements } from "@/lib/achievements";
import { completeLessonSchema } from "@/lib/validation/api";

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isYesterday(a: Date, b: Date) {
  const yesterday = new Date(b);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(a, yesterday);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: lessonId } = await params;
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const body = completeLessonSchema.parse(await request.json());

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { level: true } } },
  });
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }
  const languageId = lesson.module.level.languageId;

  const existingProgress = await db.userLessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  });

  const progress = await db.userLessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: {
      status: "COMPLETED",
      bestScore: Math.max(body.score, existingProgress?.bestScore ?? 0),
      attempts: { increment: 1 },
      completedAt: new Date(),
    },
    create: {
      user: { connect: { id: userId } },
      lesson: { connect: { id: lessonId } },
      status: "COMPLETED",
      bestScore: body.score,
      attempts: 1,
      completedAt: new Date(),
    },
  });

  const xpEarned = 20 + Math.round(body.score / 5);
  const now = new Date();
  const existingLangProfile = await db.userLanguageProfile.findUnique({
    where: { userId_languageId: { userId, languageId } },
  });

  let nextStreak = existingLangProfile?.streak ?? 0;
  if (!existingLangProfile?.lastActivityAt) {
    nextStreak = 1;
  } else if (!isSameDay(existingLangProfile.lastActivityAt, now)) {
    nextStreak = isYesterday(existingLangProfile.lastActivityAt, now)
      ? nextStreak + 1
      : 1;
  }

  const languageProfile = await db.userLanguageProfile.upsert({
    where: { userId_languageId: { userId, languageId } },
    update: {
      xp: { increment: xpEarned },
      streak: nextStreak,
      longestStreak: Math.max(nextStreak, existingLangProfile?.longestStreak ?? 0),
      lastActivityAt: now,
    },
    create: {
      user: { connect: { id: userId } },
      languageId,
      xp: xpEarned,
      streak: 1,
      longestStreak: 1,
      lastActivityAt: now,
    },
  });

  const enrolledCount = await enrollLessonReviewItems(userId, lessonId);
  const newAchievements = await checkAndAwardAchievements(userId);

  return NextResponse.json({
    progress,
    languageProfile,
    xpEarned,
    enrolledCount,
    newAchievements,
  });
}
