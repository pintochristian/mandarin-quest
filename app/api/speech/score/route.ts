import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/session";
import { speechScoreSchema } from "@/lib/validation/api";

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = speechScoreSchema.parse(await request.json());

  const attempt = await db.speakingAttempt.create({
    data: {
      userId,
      exerciseId: body.exerciseId,
      transcript: body.transcript,
      targetText: body.targetText,
      accuracyScore: body.accuracyScore,
      toneScore: body.toneScore,
    },
  });

  return NextResponse.json({ attempt });
}
