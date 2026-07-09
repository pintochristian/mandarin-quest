"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Lesson = {
  id: string;
  index: number;
  title: string;
  situationTag: string;
  isPublished: boolean;
  outline: unknown;
};
type Module = { id: string; title: string; lessons: Lesson[] };
type Level = { id: string; index: number; title: string; modules: Module[] };

export function ContentTree({ levels: initialLevels }: { levels: Level[] }) {
  const [levels, setLevels] = useState(initialLevels);

  async function togglePublished(lessonId: string, isPublished: boolean) {
    await fetch(`/api/admin/lessons/${lessonId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished }),
    });
    setLevels((prev) =>
      prev.map((level) => ({
        ...level,
        modules: level.modules.map((mod) => ({
          ...mod,
          lessons: mod.lessons.map((l) =>
            l.id === lessonId ? { ...l, isPublished } : l,
          ),
        })),
      })),
    );
  }

  async function deleteLesson(lessonId: string) {
    if (!confirm("Delete this lesson? This cannot be undone.")) return;
    await fetch(`/api/admin/lessons/${lessonId}`, { method: "DELETE" });
    setLevels((prev) =>
      prev.map((level) => ({
        ...level,
        modules: level.modules.map((mod) => ({
          ...mod,
          lessons: mod.lessons.filter((l) => l.id !== lessonId),
        })),
      })),
    );
  }

  return (
    <div className="space-y-6">
      {levels.map((level) => (
        <div key={level.id} className="space-y-2">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Level {level.index} · {level.title}
          </p>
          {level.modules.map((mod) => (
            <Card key={mod.id} className="space-y-2 rounded-2xl p-4">
              <p className="text-sm font-semibold">{mod.title}</p>
              {mod.lessons.length === 0 && (
                <p className="text-sm text-muted-foreground">No lessons yet.</p>
              )}
              {mod.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-secondary/40 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{lesson.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {lesson.outline ? "Outline only" : lesson.situationTag}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {lesson.outline ? (
                      <Badge variant="secondary">Outline</Badge>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={lesson.isPublished}
                          onCheckedChange={(checked) =>
                            togglePublished(lesson.id, checked)
                          }
                        />
                        <span className="text-xs text-muted-foreground">
                          {lesson.isPublished ? "Published" : "Draft"}
                        </span>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteLesson(lesson.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
}
