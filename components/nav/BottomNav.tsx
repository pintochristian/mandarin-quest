import Link from "next/link";
import { Home, Map, RotateCcw, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "home", href: "/", label: "Home", icon: Home },
  { key: "world", href: "/world", label: "World", icon: Map },
  { key: "review", href: "/review", label: "Review", icon: RotateCcw },
  { key: "profile", href: "/profile", label: "Profile", icon: User },
  { key: "settings", href: "/settings", label: "Settings", icon: Settings },
] as const;

export function BottomNav({ active }: { active: (typeof TABS)[number]["key"] }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-around px-2 py-2">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors",
              active === tab.key
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <tab.icon className="size-5" />
            {tab.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
