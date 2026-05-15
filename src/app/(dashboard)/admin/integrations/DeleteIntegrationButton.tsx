"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function DeleteIntegrationButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  async function handleDelete() {
    setPending(true);
    try {
      const res = await fetch(`/api/integrations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      setOpen(false);
      router.refresh();
    } catch (e) {
      alert(`Smazání selhalo: ${(e as Error).message}`);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={pending}
        className="gap-1 text-destructive hover:text-destructive"
        aria-label={`Smazat integraci ${name}`}
      >
        <Trash2 className="h-4 w-4" />
        Smazat
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
          </div>
          <DialogHeader>
            <DialogTitle>Smazat integraci</DialogTitle>
            <DialogDescription>
              Opravdu chceš smazat integraci <strong>{name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm font-medium text-destructive">Tato akce je nevratná.</p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Zrušit
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={pending}>
              {pending ? "Mažu…" : "Smazat"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
