// Generates prisma/schema.postgres.prisma from prisma/schema.prisma.
//
// The two schemas must stay identical except for the `datasource` block —
// Prisma bakes the SQL dialect into the generated client at `prisma
// generate` time, so a client generated from a sqlite schema can't be
// pointed at Postgres by swapping the runtime adapter alone. Rather than
// hand-maintaining two schema files (and risking drift), this script
// derives the Postgres variant from the single source of truth
// (schema.prisma) every time it's run. Re-run it (`npm run db:schema:postgres`)
// whenever schema.prisma changes.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.join(__dirname, "../prisma/schema.prisma");
const targetPath = path.join(__dirname, "../prisma/schema.postgres.prisma");

const source = readFileSync(sourcePath, "utf8");

const datasourceRegex = /datasource db \{[^}]*\}/;
if (!datasourceRegex.test(source)) {
  throw new Error("Could not find a `datasource db { ... }` block in schema.prisma");
}

const header = `// GENERATED FILE — do not hand-edit.
// Derived from prisma/schema.prisma by scripts/generate-postgres-schema.mjs.
// Re-run \`npm run db:schema:postgres\` after changing prisma/schema.prisma.

`;

const postgresSchema =
  header +
  source.replace(
    datasourceRegex,
    `datasource db {\n  provider = "postgresql"\n}`,
  );

writeFileSync(targetPath, postgresSchema);
console.log(`Wrote ${path.relative(process.cwd(), targetPath)}`);
