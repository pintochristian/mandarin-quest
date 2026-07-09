"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { WorldIcon } from "@/components/world/WorldIcon";
import { cn } from "@/lib/utils";
import type { WorldMapModule } from "@/lib/world-map";

export function WorldMap({ modules }: { modules: WorldMapModule[] }) {
  const frontierIndex = modules.findIndex((m) => m.status === "unlocked-active");

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
              const href =
                !locked && mod.lessons[0]
                  ? `/lesson/${mod.lessons.find((l) => !l.completed)?.id ?? mod.lessons[0].id}`
                  : undefined;

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
                </Card>
              );

              return (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.25 }}
                >
                  {href ? <Link href={href}>{content}</Link> : content}
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
