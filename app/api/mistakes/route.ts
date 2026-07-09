import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/session";
import { logMistakeSchema } from "@/lib/validation/api";
import { classifyStructuredMistake } from "@/lib/mistakes/classify";
import { classifyTranslationMistake } from "@/lib/mistakes/classifyTranslation";
import type { MistakeType } from "@/lib/generated/prisma/enums";

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = logMistakeSchema.parse(await request.json());

  const exercise = await db.exercise.findUnique({
    where: { id: body.exerciseId },
    select: { primaryNodeId: true },
  });

  let mistakeType: MistakeType;
  let detail: string | null = null;
  if (body.input.kind === "TRANSLATION") {
    mistakeType = await classifyTranslationMistake(body.input);
    detail = `wrote "${body.input.submittedText}", expected "${body.input.correctText}"`;
  } else {
    mistakeType = classifyStructuredMistake(body.input);
  }

  const mistake = await db.mistakeLog.create({
    data: {
      userId,
      exerciseId: body.exerciseId,
      nodeId: exercise?.primaryNodeId ?? null,
      mistakeType,
      detail,
    },
  });

  return NextResponse.json({ mistake });
}
