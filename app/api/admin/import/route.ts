import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { getAdminUserId } from "@/lib/session";
import { levelContentSchema, levelOutlineSchema } from "@/lib/validation/content";
import {
  importLanguage,
  importFullyAuthoredLevel,
  importOutlineLevel,
} from "@/lib/content/import";
import { lintLevelContent, lintLevelOutline } from "@/lib/content/lint";

const requestSchema = z.object({
  languageCode: z.string().min(1),
  languageName: z.string().min(1),
  kind: z.enum(["full", "outline"]),
  level: z.unknown(),
});

export async function POST(request: Request) {
  const adminId = await getAdminUserId();
  if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = requestSchema.parse(await request.json());

  const schema = body.kind === "full" ? levelContentSchema : levelOutlineSchema;
  const parsed = schema.safeParse(body.level);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  const language = await importLanguage(body.languageCode, body.languageName);

  const lintFindings =
    body.kind === "full"
      ? await lintLevelContent(parsed.data as never, language.id)
      : await lintLevelOutline(parsed.data as never, language.id);
  const blockingErrors = lintFindings.filter((f) => f.severity === "ERROR");
  if (blockingErrors.length > 0) {
    return NextResponse.json(
      { error: "Content lint failed", lintFindings },
      { status: 422 },
    );
  }

  const dbLevel =
    body.kind === "full"
      ? await importFullyAuthoredLevel(language.id, parsed.data as never)
      : await importOutlineLevel(language.id, parsed.data as never);
  revalidateTag("course-content");

  return NextResponse.json({ level: dbLevel, lintFindings });
}
