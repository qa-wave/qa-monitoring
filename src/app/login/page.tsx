import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";
import { getBrandSettings } from "@/lib/branding";

export const metadata: Metadata = {
  title: "Přihlášení",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  const brand = await getBrandSettings();
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6">
      <div className="mb-6 flex items-center gap-2 text-sm font-semibold tracking-tight">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full bg-[hsl(var(--brand-primary))] shadow-[0_0_8px_hsl(var(--brand-primary)/0.6)]"
          aria-hidden
        />
        <span>
          {brand.productName} <span className="text-muted-foreground font-normal">· {brand.tenantName}</span>
        </span>
      </div>
      <div className="w-full rounded-lg border border-border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight">Přihlásit se</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Přihlas se demo účtem. Heslo je <span className="font-mono">demo</span>.
        </p>
        <LoginFormWrapper searchParams={searchParams} />
        <div className="mt-6 space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
          <p>Demo účty (heslo <span className="font-mono">demo</span>):</p>
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
