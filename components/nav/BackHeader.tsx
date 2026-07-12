"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackHeader({ title, href = "/" }: { title: string; href?: string }) {
  const router = useRouter();
  return (
    <header className="flex items-center gap-3 border-b px-4 py-3">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        onClick={() => router.push(href)}
      >
        <X className="size-5" />
      </Button>
      <h1 className="text-base font-semibold">{title}</h1>
    </header>
  );
}
