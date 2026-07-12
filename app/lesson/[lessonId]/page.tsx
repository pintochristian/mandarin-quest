import { notFound } from "next/navigation";
import { requireOnboardedUserId } from "@/lib/session";
import { LessonRunner } from "@/components/lesson/LessonRunner";
import { mapLessonDetail } from "@/lib/lesson/mapLessonDetail";
import { getLessonContent } from "@/lib/lesson/getLessonContent";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  await requireOnboardedUserId();
  const { lessonId } = await params;

  const lesson = await getLessonContent(lessonId);

  if (!lesson || !lesson.isPublished) {
    notFound();
  }

  return <LessonRunner lesson={mapLessonDetail(lesson)} />;
}
