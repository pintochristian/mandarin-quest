import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/session";
import { getKnownMaterial, getRecentPerformance } from "@/lib/ai-tutor/known-material";
import { buildSystemPrompt } from "@/lib/ai-tutor/systemPrompt";
import { getTutorReply, isMockMode, type ChatTurn } from "@/lib/ai-tutor/client";
import { aiTutorChatSchema } from "@/lib/validation/api";

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = aiTutorChatSchema.parse(await request.json());

  let session = body.sessionId
    ? await db.aiTutorSession.findUnique({ where: { id: body.sessionId } })
    : null;
  if (session && session.userId !== userId) {
    return NextResponse.json({ error: "Not your session" }, { status: 403 });
  }
  if (!session) {
    session = await db.aiTutorSession.create({
      data: { userId, lessonId: body.lessonId },
    });
  }

  await db.aiTutorMessage.create({
    data: { sessionId: session.id, role: "USER", content: body.message },
  });

  const [known, performance, lesson] = await Promise.all([
    getKnownMaterial(userId),
    getRecentPerformance(userId),
    session.lessonId
      ? db.lesson.findUnique({
          where: { id: session.lessonId },
          select: { situationTag: true, dialogues: { select: { title: true }, take: 1 } },
        })
      : null,
  ]);

  const scenario = lesson
    ? `Practice a conversation about "${lesson.situationTag}", similar to the "${lesson.dialogues[0]?.title ?? lesson.situationTag}" dialogue the learner already studied.`
    : undefined;

  const systemPrompt = buildSystemPrompt(known, performance, scenario);

  const history = await db.aiTutorMessage.findMany({
    where: { sessionId: session.id },
    orderBy: { createdAt: "asc" },
  });
  const chatHistory: ChatTurn[] = history.map((m) => ({
    role: m.role === "USER" ? "user" : "assistant",
    content: m.content,
  }));

  let reply: string;
  try {
    reply = await getTutorReply(systemPrompt, chatHistory);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "AI tutor is unavailable right now.";
    return NextResponse.json({ error: message, sessionId: session.id }, { status: 503 });
  }

  await db.aiTutorMessage.create({
    data: { sessionId: session.id, role: "ASSISTANT", content: reply },
  });

  return NextResponse.json({ sessionId: session.id, reply, isMock: isMockMode() });
}
