"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Recharts is a large dependency (it pulls in d3 internals) that only this
// one chart needs. next/dynamic with ssr:false keeps it out of the
// server-rendered HTML and out of Profile's initial JS bundle entirely —
// it's only fetched once the browser is idle and actually renders this
// component, which matters most on mobile where every extra KB of parsed
// JS costs real time.
export const MasteryRadarLazy = dynamic(
  () => import("@/components/profile/MasteryRadar").then((m) => m.MasteryRadar),
  { ssr: false, loading: () => <Skeleton className="h-64 w-full" /> },
);
