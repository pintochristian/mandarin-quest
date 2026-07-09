import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { PracticeStylePicker } from "@/components/onboarding/PracticeStylePicker";

export default async function OnboardingPage() {
  const userId = await requireUserId();

  const settings = await db.userSettings.findUnique({ where: { userId } });
  if (settings) {
    redirect("/");
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-1 flex-col justify-center gap-8 px-6 py-10">
      <div className="space-y-2 text-center">
        <span className="font-zh text-4xl text-primary">你好</span>
        <h1 className="text-2xl font-semibold tracking-tight">
          How do you like to practice?
        </h1>
        <p className="text-sm text-muted-foreground">
          You can change this anytime in Settings.
        </p>
      </div>
      <PracticeStylePicker />
    </main>
  );
}
