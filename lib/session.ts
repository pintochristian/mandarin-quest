import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function getCurrentUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.user.id ?? null;
}

/** Redirects to sign-in if there's no session. Use in Server Components. */
export async function requireUserId(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/sign-in");
  return userId;
}

/**
 * Redirects to sign-in (no session) or onboarding (session but no
 * UserSettings yet — the presence of a UserSettings row *is* the "has
 * onboarded" signal, set by the onboarding practice-style picker).
 */
export async function requireOnboardedUserId(): Promise<string> {
  const userId = await requireUserId();
  const settings = await db.userSettings.findUnique({ where: { userId } });
  if (!settings) redirect("/onboarding");
  return userId;
}

/** Redirects home if the signed-in user isn't an admin. Use in admin pages. */
export async function requireAdminUserId(): Promise<string> {
  const userId = await requireUserId();
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") redirect("/");
  return userId;
}

/** Non-redirecting admin check for API routes — returns null instead of throwing. */
export async function getAdminUserId(): Promise<string | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === "ADMIN" ? userId : null;
}
