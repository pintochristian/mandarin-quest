import { Suspense } from "react";
import { requireOnboardedUserId } from "@/lib/session";
import { getPublishedLevels } from "@/lib/world-map";
import { PracticeConfigurator } from "@/components/practice/PracticeConfigurator";
import { BackHeader } from "@/components/nav/BackHeader";

export default async function PracticePage() {
  await requireOnboardedUserId();

  const levels = await getPublishedLevels();

  return (
    <div className="flex min-h-dvh flex-col">
      <BackHeader title="Practice Anytime" />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-6">
        <Suspense>
          <PracticeConfigurator levels={levels} />
        </Suspense>
      </main>
    </div>
  );
}
