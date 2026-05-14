"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

export function LoginForm({ from, error }: { from?: string; error?: string }) {
  const router = useRouter();
  const [email, setEmail] = React.useState("viewer@example.com");
  const [password, setPassword] = React.useState("demo");
  const [loading, setLoading] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(error ?? null);
  const [showPassword, setShowPassword] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setFormError(body.error ?? "Přihlášení selhalo.");
        setLoading(false);
        return;
      }
      router.push(from && from.startsWith("/") ? from : "/");
      router.refresh();
    } catch (err) {
      setFormError(`Výjimka: ${(err as Error).message}`);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Heslo</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "Skrýt heslo" : "Zobrazit heslo"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {formError ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {formError}
        </p>
      ) : null}
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] text-white shadow-md shadow-[hsl(var(--brand-primary)/0.25)] hover:shadow-lg hover:shadow-[hsl(var(--brand-primary)/0.3)] transition-shadow"
        disabled={loading}
      >
        {loading ? "Přihlašování…" : "Přihlásit se"}
      </Button>
    </form>
  );
}
