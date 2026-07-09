import { db } from "@/lib/db";
import { ImportExportPanel } from "@/components/admin/ImportExportPanel";

export default async function AdminImportPage() {
  const levels = await db.level.findMany({
    orderBy: { index: "asc" },
    select: { id: true, index: true, title: true },
  });

  return <ImportExportPanel levels={levels} />;
}
