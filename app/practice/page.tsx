import { db } from "@/lib/db";
import { requireOnboardedUserId } from "@/lib/session";
import { PracticeConfigurator } from "@/components/practice/PracticeConfigurator";
import { BackHeader } from "@/components/nav/BackHeader";

export default async function PracticePage() {
  await requireOnboardedUserId();

  const levels = await db.level.findMany({
    where: { modules: { some: { lessons: { some: { isPublished: true } } } } },
    select: { index: true, title: true },
    orderBy: { index: "asc" },
  });

  return (
    <div className="flex min-h-dvh flex-col">
      <BackHeader title="Practice Anytime" />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-6">
        <PracticeConfigurator levels={levels} />
      </main>
    </div>
  );
}
