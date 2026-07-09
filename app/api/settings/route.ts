import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/session";
import { updateSettingsSchema } from "@/lib/validation/api";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const settings = await db.userSettings.findUnique({ where: { userId } });
  return NextResponse.json({ settings });
}

export async function PATCH(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = updateSettingsSchema.parse(await request.json());

  const settings = await db.userSettings.upsert({
    where: { userId },
    update: body,
    create: { userId, ...body },
  });

  return NextResponse.json({ settings });
}
