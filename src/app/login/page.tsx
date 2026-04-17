import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Přihlášení",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6">
      <div className="mb-6 flex items-center gap-2 text-sm font-semibold tracking-tight">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-[hsl(var(--status-ok))]" aria-hidden />
        qa-app
      </div>
      <div className="w-full rounded-lg border border-border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight">Přihlásit se</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Přihlas se demo účtem. MVP nekontroluje hesla — jakékoliv projde.
        </p>
        <LoginFormWrapper searchParams={searchParams} />
        <div className="mt-6 space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
          <p>Demo účty:</p>
          <ul className="space-y-1">
            <li>
              <span className="font-mono">viewer@example.com</span> — role viewer
            </li>
            <li>
              <span className="font-mono">admin@example.com</span> — role admin
            </li>
          </ul>
        </div>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Chceš veřejný status?{" "}
        <Link className="underline hover:text-foreground" href="/status">
          /status
        </Link>
      </p>
    </div>
  );
}

async function LoginFormWrapper({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  const sp = await searchParams;
  return <LoginForm from={sp.from} error={sp.error} />;
}
