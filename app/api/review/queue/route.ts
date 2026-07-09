import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { getDueReviewItems } from "@/lib/srs/queue";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const items = await getDueReviewItems(userId);
  return NextResponse.json({ items });
}
