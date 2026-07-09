import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireOnboardedUserId } from "@/lib/session";
import { LessonRunner } from "@/components/lesson/LessonRunner";
import { mapLessonDetail } from "@/lib/lesson/mapLessonDetail";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  await requireOnboardedUserId();
  const { lessonId } = await params;

  const lesson = await db.lesson.findUnique({
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
  });

  if (!lesson || !lesson.isPublished) {
    notFound();
  }

  return <LessonRunner lesson={mapLessonDetail(lesson)} />;
}
