"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, CheckCircle2, ChevronDown, Circle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { WorldIcon } from "@/components/world/WorldIcon";
import { cn } from "@/lib/utils";
import type { WorldMapModule } from "@/lib/world-map";

export function WorldMap({ modules }: { modules: WorldMapModule[] }) {
  const frontierIndex = modules.findIndex((m) => m.status === "unlocked-active");
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);

  const grouped = modules.reduce<Record<string, WorldMapModule[]>>((acc, mod) => {
    (acc[mod.levelTitle] ??= []).push(mod);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([levelTitle, mods]) => (
        <div key={levelTitle} className="space-y-3">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {levelTitle}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {mods.map((mod) => {
              const isFrontier = modules.indexOf(mod) === frontierIndex;
              const locked = mod.status === "locked";
              const hasLessons = mod.lessons.length > 0;
              const hasAnyCompleted = mod.lessons.some((l) => l.completed);
              const href =
                !locked && mod.lessons[0]
                  ? `/lesson/${mod.lessons.find((l) => !l.completed)?.id ?? mod.lessons[0].id}`
                  : undefined;
              const canPickLesson = !locked && hasLessons && mod.lessons.length > 1 && hasAnyCompleted;
              const isExpanded = expandedModuleId === mod.id;

              const content = (
                <Card
                  className={cn(
                    "relative flex-row items-center gap-3 rounded-3xl p-4 transition-colors",
                    locked && "opacity-50",
                    !locked && href && "hover:border-primary/50",
                    isFrontier && "border-primary ring-2 ring-primary/30",
                  )}
                >
                  <div
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-full",
                      mod.status === "completed"
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/10 text-primary",
                    )}
                  >
                    {locked ? (
                      <Lock className="size-5" />
                    ) : mod.status === "completed" ? (
                      <CheckCircle2 className="size-5" />
                    ) : (
                      <WorldIcon icon={mod.worldIcon} className="size-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{mod.title}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {mod.lessons.length === 0
                        ? "Coming soon"
                        : `${mod.lessons.filter((l) => l.completed).length}/${mod.lessons.length} lessons`}
                    </p>
                  </div>
                  {canPickLesson && (
                    <button
                      type="button"
                      aria-label={isExpanded ? "Hide lesson list" : "Choose a lesson"}
                      aria-expanded={isExpanded}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setExpandedModuleId(isExpanded ? null : mod.id);
                      }}
                      className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <ChevronDown
                        className={cn("size-5 transition-transform", isExpanded && "rotate-180")}
                      />
                    </button>
                  )}
                </Card>
              );

              return (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="sm:col-span-1"
                >
                  {href ? <Link href={href}>{content}</Link> : content}
                  <AnimatePresence initial={false}>
                    {canPickLesson && isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 space-y-1 rounded-2xl border bg-card/50 p-2">
                          {mod.lessons.map((lesson, i) => (
                            <Link
                              key={lesson.id}
                              href={`/lesson/${lesson.id}`}
                              className="flex items-center gap-2 rounded-xl px-2 py-2 text-sm hover:bg-secondary"
                            >
                              {lesson.completed ? (
                                <CheckCircle2 className="size-4 shrink-0 text-primary" />
                              ) : (
                                <Circle className="size-4 shrink-0 text-muted-foreground/50" />
                              )}
                              <span className="min-w-0 flex-1 truncate">
                                {i + 1}. {lesson.title}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
