import { requireOnboardedUserId } from "@/lib/session";
import { getWorldMap } from "@/lib/world-map";
import { WorldMap } from "@/components/world/WorldMap";
import { BottomNav } from "@/components/nav/BottomNav";

export default async function WorldPage() {
  const userId = await requireOnboardedUserId();
  const modules = await getWorldMap(userId);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10 pb-24">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">World Map</h1>
        <p className="text-sm text-muted-foreground">
          Every completed conversation unlocks the next world.
        </p>
      </div>
      <WorldMap modules={modules} />
      <BottomNav active="world" />
    </main>
  );
}
