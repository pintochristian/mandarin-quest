import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { getWeakNodes, describeWeakNodes } from "@/lib/adaptive/recommend";

export type WorldMapModule = {
  id: string;
  key: string;
  title: string;
  description: string;
  worldIcon: string | null;
  worldTheme: string | null;
  levelTitle: string;
  levelIndex: number;
  lessons: { id: string; title: string; estimatedMinutes: number; completed: boolean }[];
  status: "locked" | "unlocked-empty" | "unlocked-active" | "completed";
};

type CourseStructureLesson = { id: string; title: string; estimatedMinutes: number };
type CourseStructureModule = {
  id: string;
  key: string;
  title: string;
  description: string;
  worldIcon: string | null;
  worldTheme: string | null;
  lessons: CourseStructureLesson[];
};
type CourseStructureLevel = {
  title: string;
  index: number;
  modules: CourseStructureModule[];
};

/**
 * The level → module → lesson structure is identical for every learner and
 * only changes when an admin edits content — it does not belong in a
 * per-request query. Cached under the "course-content" tag; admin content
 * mutations (lib/content/import.ts, the lesson publish/delete routes) call
 * `revalidateTag("course-content")` to invalidate it on demand instead of
 * waiting out the fallback revalidate window.
 */
const getCourseStructure = unstable_cache(
  async (): Promise<CourseStructureLevel[]> => {
    return db.level.findMany({
      orderBy: { index: "asc" },
      select: {
        title: true,
        index: true,
        modules: {
          orderBy: { index: "asc" },
          select: {
            id: true,
            key: true,
            title: true,
            description: true,
            worldIcon: true,
            worldTheme: true,
            lessons: {
              where: { isPublished: true },
              orderBy: { index: "asc" },
              select: { id: true, title: true, estimatedMinutes: true },
            },
          },
        },
      },
    });
  },
  ["course-structure"],
  { tags: ["course-content"], revalidate: 3600 },
);

/**
 * Levels that have at least one published lesson — used by Practice
 * Anytime's "a specific level" source picker. Reuses the same cached
 * course-structure fetch getWorldMap already relies on, instead of a
 * second raw db.level.findMany query on a route that gets visited often.
 */
export async function getPublishedLevels(): Promise<{ index: number; title: string }[]> {
  const levels = await getCourseStructure();
  return levels
    .filter((l) => l.modules.some((m) => m.lessons.length > 0))
    .map((l) => ({ index: l.index, title: l.title }));
}

/**
 * The RPG "world map": every module across every level, in order, with
 * unlock state computed from the learner's progress. A module unlocks once
 * the previous module's published lessons are all completed. The very
 * first module is always unlocked. Modules with no published lessons yet
 * (Levels 3-8 at launch) show as "unlocked-empty" once reachable, rather
 * than fake-locking content that simply hasn't been authored yet.
 */
export async function getWorldMap(userId: string): Promise<WorldMapModule[]> {
  const levels = await getCourseStructure();
  const lessonIds = levels.flatMap((level) =>
    level.modules.flatMap((mod) => mod.lessons.map((l) => l.id)),
  );

  // The only genuinely per-user, per-request piece: which of these lessons
  // has this learner completed. A single small indexed query instead of
  // re-deriving the whole course structure every time.
  const completedProgress = await db.userLessonProgress.findMany({
    where: { userId, lessonId: { in: lessonIds }, status: "COMPLETED" },
    select: { lessonId: true },
  });
  const completedIds = new Set(completedProgress.map((p) => p.lessonId));

  const flatModules = levels.flatMap((level) =>
    level.modules.map((mod) => ({
      id: mod.id,
      key: mod.key,
      title: mod.title,
      description: mod.description,
      worldIcon: mod.worldIcon,
      worldTheme: mod.worldTheme,
      levelTitle: level.title,
      levelIndex: level.index,
      lessons: mod.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        estimatedMinutes: l.estimatedMinutes,
        completed: completedIds.has(l.id),
      })),
    })),
  );

  const result: WorldMapModule[] = [];
  let previousComplete = true;

  for (const mod of flatModules) {
    const hasLessons = mod.lessons.length > 0;
    const allComplete = hasLessons && mod.lessons.every((l) => l.completed);

    let status: WorldMapModule["status"];
    if (!previousComplete) {
      status = "locked";
    } else if (allComplete) {
      status = "completed";
    } else if (hasLessons) {
      status = "unlocked-active";
    } else {
      status = "unlocked-empty";
    }

    result.push({ ...mod, status });

    // Only a fully-completed module (with real content) advances the
    // frontier; empty modules don't block unlocking what comes after them.
    previousComplete = status === "completed" || status === "unlocked-empty";
  }

  return result;
}

/**
 * The next lesson the learner hasn't completed yet, in world-map order —
 * lesson order is the fallback, not the primary signal. When the graph
 * shows the learner has weak/decayed retention on previously studied
 * nodes, the recommendation still opens the next lesson (nothing here
 * reorders the curriculum) but its `reason` names what to shore up first,
 * turning a bare lesson title into a plain-language recommendation.
 */
export async function getNextLesson(userId: string) {
  const worldMap = await getWorldMap(userId);
  let next: { id: string; title: string; estimatedMinutes: number; moduleTitle: string } | null =
    null;
  for (const mod of worldMap) {
    if (mod.status === "locked") break;
    const lesson = mod.lessons.find((l) => !l.completed);
    if (lesson) {
      next = { ...lesson, moduleTitle: mod.title };
      break;
    }
  }
  if (!next) return null;

  const weakNodes = await getWeakNodes(userId, 3);
  const reason =
    weakNodes.length > 0
      ? `Review ${describeWeakNodes(weakNodes)} before ${next.title}`
      : null;

  return { ...next, reason };
}
