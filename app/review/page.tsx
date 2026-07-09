import { requireOnboardedUserId } from "@/lib/session";
import { ReviewSession } from "@/components/review/ReviewSession";

export default async function ReviewPage() {
  await requireOnboardedUserId();
  return <ReviewSession />;
}
