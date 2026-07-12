import { Card } from "@/components/ui/card";
import { getUserStats } from "@/lib/stats";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="rounded-2xl p-4">
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </Card>
  );
}

export async function ProfileStatsGrid({
  userId,
  streak,
  longestStreak,
}: {
  userId: string;
  streak: number;
  longestStreak: number;
}) {
  const stats = await getUserStats(userId);

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard label="Current streak" value={`${streak} days`} />
      <StatCard label="Longest streak" value={`${longestStreak} days`} />
      <StatCard label="Words learned" value={`${stats.wordsLearned}`} />
      <StatCard label="Grammar rules mastered" value={`${stats.grammarRulesMastered}`} />
    </div>
  );
}
