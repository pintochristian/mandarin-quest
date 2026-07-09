import Link from "next/link";
import { SignInForm } from "@/components/auth/SignInForm";

export default function SignInPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-10">
      <div className="space-y-1 text-center">
        <span className="font-zh text-4xl text-primary">你好</span>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Pick up where you left off.</p>
      </div>
      <SignInForm />
      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/sign-up" className="font-medium text-primary">
          Create an account
        </Link>
      </p>
    </main>
  );
}
