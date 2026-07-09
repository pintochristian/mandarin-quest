import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mapLessonDetail } from "@/lib/lesson/mapLessonDetail";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const lesson = await db.lesson.findUnique({
    where: { id },
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

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  return NextResponse.json({ lesson: mapLessonDetail(lesson) });
}
