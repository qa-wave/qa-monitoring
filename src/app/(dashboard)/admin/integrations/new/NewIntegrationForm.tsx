"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProviderKind } from "@/lib/integrations/types";

export function NewIntegrationForm({
  providerKey,
  providerKind: _providerKind,
  isReal,
}: {
  providerKey: string;
  providerKind: ProviderKind;
  isReal: boolean;
}) {
  const router = useRouter();
  const [displayName, setDisplayName] = React.useState("");
  const [credentials, setCredentials] = React.useState<Record<string, string>>({});
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fields: { key: string; label: string; placeholder?: string; type?: string }[] = React.useMemo(() => {
    if (providerKey === "github") {
      return [
        { key: "owner", label: "GitHub owner", placeholder: "např. anthropics" },
        { key: "repo", label: "Repository", placeholder: "např. claude-code" },
        {
          key: "token",
          label: "Personal access token",
          placeholder: "ghp_...",
          type: "password",
        },
        { key: "defaultBranch", label: "Default branch", placeholder: "main" },
      ];
    }
    return [
      { key: "apiUrl", label: "API URL (volitelné)", placeholder: "https://api.example.com" },
      { key: "apiToken", label: "API token (volitelné)", placeholder: "...", type: "password" },
    ];
  }, [providerKey]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerKey, displayName, credentials, enabled: true }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? "Uložení selhalo.");
        setPending(false);
        return;
      }
      router.push("/admin/integrations");
      router.refresh();
    } catch (err) {
      setError(`Výjimka: ${(err as Error).message}`);
      setPending(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="displayName">Zobrazované jméno</Label>
        <Input
          id="displayName"
          required
          placeholder={isReal ? "např. GitHub · hlavní monorepo" : "např. Sentry · mock"}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>
      {fields.map((f) => (
        <div key={f.key} className="space-y-2">
          <Label htmlFor={f.key}>{f.label}</Label>
          <Input
            id={f.key}
            type={f.type ?? "text"}
            placeholder={f.placeholder}
            value={credentials[f.key] ?? ""}
            onChange={(e) => setCredentials((c) => ({ ...c, [f.key]: e.target.value }))}
          />
        </div>
      ))}
      {!isReal ? (
        <p className="rounded-md border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
          Toto je mock adapter — hodnoty credentials se neukládají do externí služby, jen demonstrují UI. Reálná data čte z fixtur.
        </p>
      ) : null}
      {error ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/integrations")}>
          Zrušit
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Ukládání…" : "Uložit"}
        </Button>
      </div>
    </form>
  );
}
