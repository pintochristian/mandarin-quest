import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminUserId } from "@/lib/session";

export async function GET() {
  const adminId = await getAdminUserId();
  if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const levels = await db.level.findMany({
    orderBy: { index: "asc" },
    include: {
      modules: {
        orderBy: { index: "asc" },
        include: {
          lessons: {
            orderBy: { index: "asc" },
            select: {
              id: true,
              index: true,
              title: true,
              situationTag: true,
              isPublished: true,
              outline: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json({ levels });
}
