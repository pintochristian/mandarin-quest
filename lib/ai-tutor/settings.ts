import { db } from "@/lib/db";
import { hasAiProvider } from "@/lib/ai-tutor/client";

/**
 * Whether AI-dependent lesson/practice features should actually be shown
 * to this learner right now — combines the deployment-level provider state
 * (hasAiProvider) with the learner's own opt-in (UserSettings.aiEnabled,
 * default false for every account). Both must be true; neither implies
 * the other. Every AI-only UI surface (the AI_CONVERSATION lesson step,
 * the AI_TEXT_CHAT interaction mode) checks this instead of hasAiProvider
 * alone, so a learner who never opted in never sees AI-flavored UI even
 * though the deployment happens to have a key configured.
 */
export async function shouldUseAi(userId: string): Promise<boolean> {
  if (!hasAiProvider()) return false;
  const settings = await db.userSettings.findUnique({
    where: { userId },
    select: { aiEnabled: true },
  });
  return settings?.aiEnabled ?? false;
}
