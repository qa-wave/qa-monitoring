"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteIntegrationButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function handleDelete() {
    if (!confirm(`Smazat integraci „${name}"?`)) return;
    setPending(true);
    try {
      const res = await fetch(`/api/integrations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      router.refresh();
    } catch (e) {
      alert(`Smazání selhalo: ${(e as Error).message}`);
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={pending}
      className="gap-1 text-destructive hover:text-destructive"
      aria-label={`Smazat integraci ${name}`}
    >
      <Trash2 className="h-4 w-4" />
      Smazat
    </Button>
  );
}
