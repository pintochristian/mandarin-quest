import { requireOnboardedUserId } from "@/lib/session";
import { getWordBank } from "@/lib/wordbank/getWordBank";
import { WordBankView } from "@/components/wordbank/WordBankView";
import { BackHeader } from "@/components/nav/BackHeader";

export default async function WordsPage() {
  const userId = await requireOnboardedUserId();
  const entries = await getWordBank(userId);

  return (
    <div className="flex min-h-dvh flex-col">
      <BackHeader title="My Words" />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-6">
        <WordBankView entries={entries} />
      </main>
    </div>
  );
}
