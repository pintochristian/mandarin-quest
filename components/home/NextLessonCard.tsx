import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getNextLesson } from "@/lib/world-map";

export async function NextLessonCard({ userId }: { userId: string }) {
  const nextLesson = await getNextLesson(userId);
  if (!nextLesson) return null;

  return (
    <Link href={`/lesson/${nextLesson.id}`}>
      <Card className="flex-row items-center gap-4 rounded-2xl p-4 transition-colors hover:border-primary/50">
        <BookOpen className="size-6 text-primary" />
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase">
            {nextLesson.moduleTitle}
          </p>
          <p className="font-medium">{nextLesson.title}</p>
          <p className="text-sm text-muted-foreground">
            {nextLesson.reason ?? `${nextLesson.estimatedMinutes} min · continue learning`}
          </p>
        </div>
      </Card>
    </Link>
  );
}
