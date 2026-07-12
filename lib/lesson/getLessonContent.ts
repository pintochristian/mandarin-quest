import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";

/**
 * Full lesson content (grammar/vocab/dialogue/exercises) is identical for
 * every learner and only changes through the admin JSON import pipeline or
 * the publish/delete routes — both already call
 * revalidateTag("course-content"). Previously this deeply-nested query ran
 * fresh from Postgres on every single lesson visit even though the content
 * never differs between users.
 */
export const getLessonContent = unstable_cache(
  (lessonId: string) =>
    db.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: { include: { level: true } },
        lessonNodes: {
          orderBy: { order: "asc" },
          include: { node: true },
        },
        dialogues: { include: { lines: { orderBy: { order: "asc" } } } },
        exercises: { orderBy: { order: "asc" } },
      },
    }),
  ["lesson-content"],
  { tags: ["course-content"], revalidate: 3600 },
);
