import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getMemoryScore } from "@/lib/stats";

function MemoryScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{Math.round(value * 100)}%</span>
      </div>
      <Progress value={value * 100} className="h-1.5" />
    </div>
  );
}

export async function MemoryScoreCard({ userId }: { userId: string }) {
  const memoryScore = await getMemoryScore(userId);

  return (
    <Card className="space-y-3 rounded-3xl p-4">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-medium">Memory Score</p>
        <p className="text-2xl font-semibold text-primary">
          {Math.round(memoryScore.overall * 100)}%
        </p>
      </div>
      <p className="text-xs text-muted-foreground">
        How much of what you&rsquo;ve studied you likely still remember right now — this
        naturally drops if you fall behind on review.
      </p>
      <MemoryScoreBar label="Review health" value={memoryScore.reviewHealth} />
    </Card>
  );
}
