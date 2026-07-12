import { Suspense } from "react";
import Link from "next/link";
import { Flame, Star, Dumbbell, BookMarked } from "lucide-react";
import { db } from "@/lib/db";
import { requireOnboardedUserId } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { BottomNav } from "@/components/nav/BottomNav";
import { NextLessonCard } from "@/components/home/NextLessonCard";
import { ReviewCard } from "@/components/home/ReviewCard";
import { MasteryCard } from "@/components/home/MasteryCard";
import { AchievementsSection } from "@/components/home/AchievementsSection";

export default async function Home() {
  const userId = await requireOnboardedUserId();
  const languageProfile = await db.userLanguageProfile.findFirst({ where: { userId } });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-zh text-2xl text-primary">你好</span>
        </div>
        <SignOutButton />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatTile
          icon={<Flame className="size-5 text-primary" />}
          value={`${languageProfile?.streak ?? 0}`}
          label="Streak"
        />
        <StatTile
          icon={<Star className="size-5 text-primary" />}
          value={`${languageProfile?.xp ?? 0}`}
          label="XP"
        />
        <StatTile
          icon={<span className="font-zh text-lg text-primary">级</span>}
          value={`${languageProfile?.conversationLevel ?? 1}`}
          label="Level"
        />
      </div>

      <Suspense fallback={<Skeleton className="h-20 w-full rounded-2xl" />}>
        <NextLessonCard userId={userId} />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-20 w-full rounded-2xl" />}>
        <ReviewCard userId={userId} />
      </Suspense>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/practice">
          <Card className="items-center gap-2 rounded-2xl p-4 text-center transition-colors hover:border-primary/50">
            <Dumbbell className="size-5 text-primary" />
            <p className="text-sm font-medium">Practice Anytime</p>
          </Card>
        </Link>
        <Link href="/words">
          <Card className="items-center gap-2 rounded-2xl p-4 text-center transition-colors hover:border-primary/50">
            <BookMarked className="size-5 text-primary" />
            <p className="text-sm font-medium">My Words</p>
          </Card>
        </Link>
      </div>

      <Suspense fallback={<Skeleton className="h-40 w-full rounded-2xl" />}>
        <MasteryCard userId={userId} />
      </Suspense>

      <Suspense fallback={null}>
        <AchievementsSection userId={userId} />
      </Suspense>

      <BottomNav active="home" />
    </main>
  );
}

function StatTile({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <Card className="flex flex-col items-center gap-1 rounded-2xl p-3">
      {icon}
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Card>
  );
}
