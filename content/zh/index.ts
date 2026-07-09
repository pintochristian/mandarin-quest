import type { LevelContentInput } from "@/lib/validation/content";
import { zhLanguage } from "./language";
import { level1 } from "./level-1";
import { outlineLevels } from "./outline-levels";
import level1GettingAround2 from "./imported/level1-getting-around-2.json";
import level1DailyLife from "./imported/level1-daily-life.json";
import level1FamilyFriends from "./imported/level1-family-friends.json";
import level2Content from "./imported/level2-content.json";

// The `imported/` files are lesson batches originally authored by parallel
// content-generation passes and imported through the admin JSON pipeline
// (app/api/admin/import) — committed here (rather than left in a scratch
// directory) so the full 22-lesson curriculum is reproducible from the repo
// alone on any fresh database, dev or production. Each shares level.index
// with level1 (1) or is its own level (2); importFullyAuthoredLevel upserts
// by level/module/lesson index, so importing them after level1 merges in
// their modules rather than overwriting it.
export const zhContent = {
  language: zhLanguage,
  fullyAuthoredLevels: [
    level1,
    level1GettingAround2 as LevelContentInput,
    level1DailyLife as LevelContentInput,
    level1FamilyFriends as LevelContentInput,
    level2Content as LevelContentInput,
  ],
  outlineLevels,
};
