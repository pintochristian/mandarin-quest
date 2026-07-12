import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { startPracticeSessionSchema } from "@/lib/validation/api";
import { generatePracticeSession } from "@/lib/practice/session";

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = startPracticeSessionSchema.parse(await request.json());
  const sessionId = crypto.randomUUID();

  const questions = await generatePracticeSession(userId, body.source, body.length, sessionId);

  return NextResponse.json({ sessionId, questions });
}
