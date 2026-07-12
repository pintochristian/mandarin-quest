import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/session";

/**
 * Reports non-secret facts (Vercel function region, DB hostname, whether
 * the hostname looks like Neon's pooled endpoint) needed to verify
 * function/database co-location without exposing credentials. Admin-gated.
 */
export async function GET() {
  const adminId = await getAdminUserId();
  if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const rawUrl = process.env.DATABASE_URL ?? "";
  let dbHost = "unknown";
  try {
    const parsed = new URL(rawUrl.startsWith("file:") ? "file:///none" : rawUrl);
    dbHost = parsed.hostname;
  } catch {
    dbHost = "unparseable";
  }

  return NextResponse.json({
    vercelRegion: process.env.VERCEL_REGION ?? null,
    vercelEnv: process.env.VERCEL_ENV ?? null,
    dbHost,
    dbHostLooksPooled: dbHost.includes("-pooler"),
  });
}
