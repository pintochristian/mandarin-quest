import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/session";
import { exportLevel } from "@/lib/content/export";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ levelId: string }> },
) {
  const adminId = await getAdminUserId();
  if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { levelId } = await params;
  const level = await exportLevel(levelId);

  return NextResponse.json(level);
}
