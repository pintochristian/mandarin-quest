import { Suspense } from "react";
import { db } from "@/lib/db";
import { requireOnboardedUserId } from "@/lib/session";
import { Skeleton } from "@/components/ui/skeleton";
import { MemoryScoreCard } from "@/components/profile/MemoryScoreCard";
import { MasteryRadarSection } from "@/components/profile/MasteryRadarSection";
import { ProfileStatsGrid } from "@/components/profile/ProfileStatsGrid";
import { ProfileAchievementsGrid } from "@/components/profile/ProfileAchievementsGrid";
import { BottomNav } from "@/components/nav/BottomNav";

export default async function ProfilePage() {
  const userId = await requireOnboardedUserId();
  const languageProfile = await db.userLanguageProfile.findFirst({ where: { userId } });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10 pb-24">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Conversation level {languageProfile?.conversationLevel ?? 1}
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-36 w-full rounded-3xl" />}>
        <MemoryScoreCard userId={userId} />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-64 w-full rounded-3xl" />}>
        <MasteryRadarSection userId={userId} />
      </Suspense>

      <Suspense
        fallback={
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
          </div>
        }
      >
        <ProfileStatsGrid
          userId={userId}
          streak={languageProfile?.streak ?? 0}
          longestStreak={languageProfile?.longestStreak ?? 0}
        />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-32 w-full rounded-2xl" />}>
        <ProfileAchievementsGrid userId={userId} />
      </Suspense>

      <BottomNav active="profile" />
    </main>
  );
}
