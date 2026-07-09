/**
 * Read-time forgetting-curve decay: `masteryScore` is only updated when a
 * review happens (lib/srs/queue.ts), but retention keeps eroding between
 * reviews. Rather than a cron job rewriting stored scores, every reader
 * (lib/stats.ts, lib/adaptive/recommend.ts) applies this decay function to
 * the stored score at read time using `nextReviewAt` as the reference point.
 *
 * Half-life is proportional to the node's current SM-2 interval: a word
 * reviewed every 1 day decays fast once overdue, while a word with a
 * 60-day interval (well consolidated) decays slowly — matching how spaced
 * repetition intervals already encode confidence.
 */
export function decayedMasteryScore(
  masteryScore: number,
  intervalDays: number,
  nextReviewAt: Date,
  now: Date = new Date(),
): number {
  const msOverdue = now.getTime() - nextReviewAt.getTime();
  if (msOverdue <= 0) return masteryScore;

  const daysOverdue = msOverdue / 86_400_000;
  const halfLife = Math.max(1, intervalDays);
  return masteryScore * Math.pow(0.5, daysOverdue / halfLife);
}
