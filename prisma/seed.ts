import "dotenv/config";
import { db } from "../lib/db";
import { Prisma } from "../lib/generated/prisma/client";
import { levelContentSchema, levelOutlineSchema } from "../lib/validation/content";
import {
  importLanguage,
  importFullyAuthoredLevel,
  importOutlineLevel,
} from "../lib/content/import";
import { zhContent } from "../content/zh";
import { achievements } from "../content/achievements";

async function main() {
  console.log("Seeding language...");
  const language = await importLanguage(zhContent.language.code, zhContent.language.name);

  console.log("Validating and seeding fully authored levels...");
  for (const level of zhContent.fullyAuthoredLevels) {
    const parsed = levelContentSchema.parse(level);
    await importFullyAuthoredLevel(language.id, parsed);
    console.log(`  Level ${parsed.index} (${parsed.title}) seeded.`);
  }

  console.log("Validating and seeding outline levels...");
  for (const level of zhContent.outlineLevels) {
    const parsed = levelOutlineSchema.parse(level);
    await importOutlineLevel(language.id, parsed);
    console.log(`  Level ${parsed.index} (${parsed.title}) outline seeded.`);
  }

  console.log("Seeding achievements...");
  for (const achievement of achievements) {
    const criteria = achievement.criteria as Prisma.InputJsonValue;
    await db.achievement.upsert({
      where: { code: achievement.code },
      update: {
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        criteria,
      },
      create: { ...achievement, criteria },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
