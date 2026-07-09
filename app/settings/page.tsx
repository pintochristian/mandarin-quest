import { requireOnboardedUserId } from "@/lib/session";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { BottomNav } from "@/components/nav/BottomNav";

export default async function SettingsPage() {
  await requireOnboardedUserId();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10 pb-24">
      <h1 className="text-center text-2xl font-semibold tracking-tight">Settings</h1>
      <SettingsForm />
      <BottomNav active="settings" />
    </main>
  );
}
