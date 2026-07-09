import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { submitReview } from "@/lib/srs/queue";
import { submitReviewSchema } from "@/lib/validation/api";

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = submitReviewSchema.parse(await request.json());

  const updated = await submitReview(
    body.reviewItemId,
    userId,
    body.quality,
    body.responseTimeMs,
  );

  return NextResponse.json({ reviewItem: updated });
}
