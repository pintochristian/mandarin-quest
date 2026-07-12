"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Same rationale as MasteryRadarLazy — keep Recharts out of the admin
// dashboard's initial bundle, only fetched once this chart actually renders.
export const CompletionTrendChartLazy = dynamic(
  () => import("@/components/admin/CompletionTrendChart").then((m) => m.CompletionTrendChart),
  { ssr: false, loading: () => <Skeleton className="h-56 w-full" /> },
);
