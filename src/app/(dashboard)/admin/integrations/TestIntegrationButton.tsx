"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TestIntegrationButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [result, setResult] = React.useState<{ ok: boolean; message: string } | null>(null);

  async function handleTest() {
    setPending(true);
    setResult(null);
    try {
      const res = await fetch(`/api/integrations/${id}/test`, { method: "POST" });
      const body = (await res.json()) as { ok: boolean; message: string };
      setResult(body);
      setTimeout(() => router.refresh(), 500);
    } catch (e) {
      setResult({ ok: false, message: (e as Error).message });
    } finally {
      setPending(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleTest} disabled={pending} className="gap-1">
        <RefreshCcw className={pending ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
        {pending ? "Testuji…" : "Test"}
      </Button>
      {result ? (
        <span
          className={
            result.ok
              ? "inline-flex items-center gap-1 text-xs text-[hsl(var(--status-ok))]"
              : "inline-flex items-center gap-1 text-xs text-[hsl(var(--status-down))]"
          }
        >
          {result.ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
          {result.message.slice(0, 80)}
        </span>
      ) : null}
    </span>
  );
}
