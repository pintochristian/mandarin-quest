import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/session";
import { logPracticeAttemptSchema } from "@/lib/validation/api";

/**
 * Writes only to PracticeAttempt — never touches UserNodeMastery. This is
 * the whole point of keeping voluntary practice separate from Scheduled
 * Daily Review: it is architecturally impossible for a call here to move
 * nextReviewAt/intervalDays/repetitions/lapses, because this route never
 * reads or writes that table at all. Daily Review's SRS fields are only
 * ever mutated by lib/srs/queue.ts's submitReview, via /api/review/submit.
 */
export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = logPracticeAttemptSchema.parse(await request.json());

  const attempt = await db.practiceAttempt.create({
    data: {
      userId,
      nodeId: body.nodeId,
      sessionId: body.sessionId,
      mode: body.mode,
      correct: body.correct,
      responseTimeMs: body.responseTimeMs,
    },
  });

  return NextResponse.json({ attempt });
}
