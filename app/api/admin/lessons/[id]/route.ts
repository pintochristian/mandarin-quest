import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminUserId } from "@/lib/session";

const patchSchema = z.object({ isPublished: z.boolean() });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminId = await getAdminUserId();
  if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = patchSchema.parse(await request.json());

  const lesson = await db.lesson.update({
    where: { id },
    data: { isPublished: body.isPublished },
  });
  revalidateTag("course-content");

  return NextResponse.json({ lesson });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminId = await getAdminUserId();
  if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await db.lesson.delete({ where: { id } });
  revalidateTag("course-content");

  return NextResponse.json({ ok: true });
}
