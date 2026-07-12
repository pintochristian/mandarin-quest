import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getUserStats } from "@/lib/stats";

function MasteryBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{Math.round(value * 100)}%</span>
      </div>
      <Progress value={value * 100} className="h-2" />
    </div>
  );
}

export async function MasteryCard({ userId }: { userId: string }) {
  const stats = await getUserStats(userId);

  return (
    <Card className="space-y-4 rounded-2xl p-4">
      <p className="text-sm font-medium">Mastery</p>
      <MasteryBar label="Grammar" value={stats.grammarMastery} />
      <MasteryBar label="Vocabulary" value={stats.vocabularyMastery} />
      <MasteryBar label="Speaking" value={stats.pronunciationScore} />
    </Card>
  );
}
