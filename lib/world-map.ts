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

/**
 * The RPG "world map": every module across every level, in order, with
 * unlock state computed from the learner's progress. A module unlocks once
 * the previous module's published lessons are all completed. The very
 * first module is always unlocked. Modules with no published lessons yet
 * (Levels 3-8 at launch) show as "unlocked-empty" once reachable, rather
 * than fake-locking content that simply hasn't been authored yet.
 */
export async function getWorldMap(userId: string): Promise<WorldMapModule[]> {
  const levels = await db.level.findMany({
    orderBy: { index: "asc" },
    include: {
      modules: {
        orderBy: { index: "asc" },
        include: {
          lessons: {
            where: { isPublished: true },
            orderBy: { index: "asc" },
            include: { userProgress: { where: { userId } } },
          },
        },
      },
    },
  });

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
        completed: l.userProgress.some((p) => p.status === "COMPLETED"),
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
