import { notFound } from "next/navigation";
import { requireOnboardedUserId } from "@/lib/session";
import { shouldUseAi } from "@/lib/ai-tutor/settings";
import { LessonRunner } from "@/components/lesson/LessonRunner";
import { mapLessonDetail } from "@/lib/lesson/mapLessonDetail";
import { getLessonContent } from "@/lib/lesson/getLessonContent";

export default async function LessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ lessonId: string }>;
  searchParams: Promise<{ start?: string }>;
}) {
  const userId = await requireOnboardedUserId();
  const { lessonId } = await params;
  const { start } = await searchParams;

  const [lesson, aiAvailable] = await Promise.all([
    getLessonContent(lessonId),
    shouldUseAi(userId),
  ]);

  if (!lesson || !lesson.isPublished) {
    notFound();
  }

  return (
    <LessonRunner
      lesson={mapLessonDetail(lesson)}
      aiAvailable={aiAvailable}
      skipReview={start === "content"}
    />
  );
}
