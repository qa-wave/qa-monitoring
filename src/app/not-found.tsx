import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[hsl(var(--brand-primary)/0.06)] via-background to-[hsl(var(--brand-secondary)/0.08)] px-4">
      <div
        className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-[hsl(var(--brand-primary)/0.05)] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-[hsl(var(--brand-secondary)/0.06)] blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--brand-primary))] shadow-lg shadow-[hsl(var(--brand-primary)/0.3)]">
          <span className="inline-block h-3 w-3 rounded-full bg-white" aria-hidden />
        </div>

        <h1 className="bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] bg-clip-text font-mono text-8xl font-bold tabular-nums text-transparent">
          404
        </h1>

        <h2 className="mt-4 text-xl font-semibold tracking-tight">Stránka nenalezena</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Tato stránka neexistuje nebo byla přesunuta. Zkuste se vrátit na
          dashboard nebo použijte vyhledávání.
        </p>

        <div className="mt-8 flex items-center gap-3">
          <Button asChild className="bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] text-white shadow-md shadow-[hsl(var(--brand-primary)/0.25)]">
            <Link href="/">
              <Home className="h-4 w-4" />
              Zpět na dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <Search className="h-4 w-4" />
              Vyhledávání
              <kbd className="ml-1.5 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
