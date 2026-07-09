import { Card } from "@/components/ui/card";
import { getAnalytics } from "@/lib/admin/analytics";
import { CompletionTrendChart } from "@/components/admin/CompletionTrendChart";

export default async function AdminDashboardPage() {
  const analytics = await getAnalytics();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <Card className="rounded-2xl p-4">
          <p className="text-2xl font-semibold">{analytics.userCount}</p>
          <p className="text-sm text-muted-foreground">Users</p>
        </Card>
        <Card className="rounded-2xl p-4">
          <p className="text-2xl font-semibold">{analytics.lessonsCompletedCount}</p>
          <p className="text-sm text-muted-foreground">Lessons completed</p>
        </Card>
        <Card className="rounded-2xl p-4">
          <p className="text-2xl font-semibold">
            {analytics.avgReviewQuality.toFixed(1)}/5
          </p>
          <p className="text-sm text-muted-foreground">Avg review quality</p>
        </Card>
      </div>

      <Card className="rounded-2xl p-4">
        <p className="mb-2 text-sm font-medium">Lesson completions, last 14 days</p>
        <CompletionTrendChart data={analytics.completionTrend} />
      </Card>

      <Card className="rounded-2xl p-4">
        <p className="mb-3 text-sm font-medium">Most popular lessons</p>
        <div className="space-y-2">
          {analytics.popularLessons.length === 0 && (
            <p className="text-sm text-muted-foreground">No completions yet.</p>
          )}
          {analytics.popularLessons.map((l) => (
            <div key={l.lessonId} className="flex items-center justify-between text-sm">
              <span>{l.title}</span>
              <span className="font-medium text-muted-foreground">
                {l.completions} completion{l.completions === 1 ? "" : "s"}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
