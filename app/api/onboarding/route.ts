import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/session";
import { onboardingSchema } from "@/lib/validation/api";

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = onboardingSchema.parse(await request.json());

  const language = await db.language.findUniqueOrThrow({ where: { code: "zh" } });

  const [settings] = await Promise.all([
    db.userSettings.upsert({
      where: { userId },
      update: { practiceMode: body.practiceMode },
      create: { userId, practiceMode: body.practiceMode },
    }),
    db.userLanguageProfile.upsert({
      where: { userId_languageId: { userId, languageId: language.id } },
      update: {},
      create: { userId, languageId: language.id },
    }),
  ]);

  return NextResponse.json({ settings });
}
