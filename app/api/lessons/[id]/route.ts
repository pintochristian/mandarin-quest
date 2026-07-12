import { NextResponse } from "next/server";
import { mapLessonDetail } from "@/lib/lesson/mapLessonDetail";
import { getLessonContent } from "@/lib/lesson/getLessonContent";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const lesson = await getLessonContent(id);

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  return NextResponse.json({ lesson: mapLessonDetail(lesson) });
}
