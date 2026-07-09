import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
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
              estimatedMinutes: true,
              isPublished: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json({ levels });
}
