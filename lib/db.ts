import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Local dev always uses SQLite (a `file:` URL); production uses Postgres.
// Whichever schema (prisma/schema.prisma vs prisma/schema.postgres.prisma)
// was used to run `prisma generate` in a given environment determines the
// SQL dialect this generated client actually speaks — this branch just has
// to pick the matching *driver adapter* (connection layer) for that same
// environment's DATABASE_URL, which is always consistent by construction
// (see package.json's db:generate:postgres / vercel-build scripts).
function createClient() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  const adapter = url.startsWith("file:")
    ? new PrismaBetterSqlite3({ url: url.replace(/^file:/, "") })
    : new PrismaPg({ connectionString: url });
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
