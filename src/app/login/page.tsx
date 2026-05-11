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
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-[hsl(var(--brand-primary)/0.06)] via-background to-[hsl(var(--brand-secondary)/0.08)] px-4">
      {/* Subtle decorative circles */}
      <div
        className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-[hsl(var(--brand-primary)/0.05)] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-[hsl(var(--brand-secondary)/0.06)] blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Brand header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--brand-primary))] shadow-lg shadow-[hsl(var(--brand-primary)/0.3)]">
            <span
              className="inline-block h-3 w-3 rounded-full bg-white"
              aria-hidden
            />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">{brand.productName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{brand.tenantName}</p>
        </div>

        {/* Login card */}
        <div className="rounded-xl border border-border bg-card/80 p-6 shadow-sm backdrop-blur-sm">
          <h2 className="text-lg font-semibold tracking-tight">Přihlásit se</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Zadej přihlašovací údaje pro přístup do dashboardu.
          </p>
          <LoginFormWrapper searchParams={searchParams} />
        </div>

        {/* Demo credentials — subtle */}
        <div className="mt-4 rounded-lg border border-border/60 bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
          <p className="mb-1.5 font-medium text-muted-foreground/80">Demo účty</p>
          <div className="space-y-1">
            <p>
              <span className="font-mono">viewer@example.com</span>{" "}
              <span className="text-muted-foreground/60">/ demo</span>
            </p>
            <p>
              <span className="font-mono">admin@example.com</span>{" "}
              <span className="text-muted-foreground/60">/ demo</span>
            </p>
          </div>
        </div>

        {/* Footer link */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link className="underline underline-offset-2 hover:text-foreground transition-colors" href="/status">
            Veřejná status stránka
          </Link>
        </p>
      </div>
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
