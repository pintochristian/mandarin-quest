import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/session";
import { getAnalytics } from "@/lib/admin/analytics";

export async function GET() {
  const adminId = await getAdminUserId();
  if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const analytics = await getAnalytics();
  return NextResponse.json(analytics);
}
