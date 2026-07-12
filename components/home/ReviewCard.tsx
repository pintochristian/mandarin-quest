import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { countDueReviewItems } from "@/lib/srs/queue";

export async function ReviewCard({ userId }: { userId: string }) {
  const dueCount = await countDueReviewItems(userId);

  return (
    <Link href="/review">
      <Card className="flex-row items-center gap-4 rounded-2xl border-primary/30 bg-primary/5 p-4 transition-colors hover:border-primary/60">
        <RotateCcw className="size-6 text-primary" />
        <div className="flex-1">
          <p className="font-medium">Review due today</p>
          <p className="text-sm text-muted-foreground">
            {dueCount > 0 ? `${dueCount} items ready` : "Nothing due right now"}
          </p>
        </div>
        {dueCount > 0 && <Badge>{dueCount}</Badge>}
      </Card>
    </Link>
  );
}
