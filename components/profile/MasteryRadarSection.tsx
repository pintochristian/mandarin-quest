import { Card } from "@/components/ui/card";
import { MasteryRadarLazy } from "@/components/profile/MasteryRadarLazy";
import { getUserStats } from "@/lib/stats";

export async function MasteryRadarSection({ userId }: { userId: string }) {
  const stats = await getUserStats(userId);

  const radarData = [
    { metric: "Grammar", value: Math.round(stats.grammarMastery * 100) },
    { metric: "Vocabulary", value: Math.round(stats.vocabularyMastery * 100) },
    { metric: "Conversation", value: Math.round(stats.conversationMastery * 100) },
    { metric: "Pronunciation", value: Math.round(stats.pronunciationScore * 100) },
    { metric: "Listening", value: Math.round(stats.listeningMastery * 100) },
  ];

  return (
    <Card className="rounded-3xl p-4">
      <MasteryRadarLazy data={radarData} />
    </Card>
  );
}
