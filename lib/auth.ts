import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";

// lib/db.ts picks SQLite vs Postgres from DATABASE_URL's scheme — the auth
// adapter's dialect needs to track that same choice (it affects supported
// query modes/types, e.g. case-insensitive filtering and native UUIDs).
const isPostgres = (process.env.DATABASE_URL ?? "").startsWith("postgres");

// Vercel preview deployments get a new *.vercel.app URL per deploy, so a
// static allowlist can't cover them. Better Auth matches wildcard patterns
// natively (see trustedOrigins below); the wildcard is only added outside
// real production so a production deployment never trusts an arbitrary
// *.vercel.app origin.
const isProduction = process.env.VERCEL_ENV === "production";

const trustedOrigins = Array.from(
  new Set(
    [
      process.env.BETTER_AUTH_URL,
      "http://localhost:3000",
      "https://mandarin-quest-rho.vercel.app",
      !isProduction ? "https://*.vercel.app" : null,
    ].filter((origin): origin is string => Boolean(origin)),
  ),
);

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins,
  database: prismaAdapter(db, { provider: isPostgres ? "postgresql" : "sqlite" }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    // Every server-rendered page calls getSession() (lib/session.ts) — without
    // this, that's a full DB round-trip on every single navigation, even
    // clicking between pages seconds apart. Caches the session in a signed
    // cookie for a short window instead; still re-validates against the DB
    // at least once a minute, and any explicit sign-out still clears the
    // session token itself.
    cookieCache: {
      enabled: true,
      maxAge: 60,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "LEARNER",
        input: false,
      },
    },
  },
});
