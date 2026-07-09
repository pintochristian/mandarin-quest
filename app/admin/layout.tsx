import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdminUserId } from "@/lib/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminUserId();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col gap-6 px-6 py-8">
      <header className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-5" />
          </Link>
          <h1 className="text-lg font-semibold">Admin</h1>
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium">
          <Link href="/admin" className="text-muted-foreground hover:text-primary">
            Dashboard
          </Link>
          <Link
            href="/admin/content"
            className="text-muted-foreground hover:text-primary"
          >
            Content
          </Link>
          <Link href="/admin/import" className="text-muted-foreground hover:text-primary">
            Import / Export
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
