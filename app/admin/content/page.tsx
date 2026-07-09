import { db } from "@/lib/db";
import { ContentTree } from "@/components/admin/ContentTree";

export default async function AdminContentPage() {
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
              isPublished: true,
              outline: true,
            },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Toggle publish state or remove lessons. Full content authoring happens via JSON
        import.
      </p>
      <ContentTree levels={levels} />
    </div>
  );
}
