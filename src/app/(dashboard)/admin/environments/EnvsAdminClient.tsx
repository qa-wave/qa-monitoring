"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Environment } from "@/lib/types";

type ToastState = { kind: "ok" | "error"; message: string } | null;

/* ------------------------------------------------------------------ */
/*  Edit Dialog                                                        */
/* ------------------------------------------------------------------ */

function EditEnvDialog({
  env,
  onClose,
  onSave,
  pending,
}: {
  env: Environment;
  onClose: () => void;
  onSave: (id: string, patch: Partial<Environment>) => Promise<boolean>;
  pending: string | null;
}) {
  const [name, setName] = React.useState(env.name);
  const [slug, setSlug] = React.useState(env.slug);
  const [url, setUrl] = React.useState(env.url);
  const [region, setRegion] = React.useState(env.region);
  const [color, setColor] = React.useState(env.color);
  const [isProduction, setIsProduction] = React.useState(env.isProduction);
  const [order, setOrder] = React.useState(env.order);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await onSave(env.id, {
      name,
      slug,
      url,
      region,
      color,
      isProduction,
      order,
    });
    if (ok) onClose();
  }

  const isBusy = pending === env.id;

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upravit prostředí</DialogTitle>
          <DialogDescription>
            Uprav vlastnosti prostředí {env.name}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-env-name">Název</Label>
              <Input id="edit-env-name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-env-slug">Slug</Label>
              <Input id="edit-env-slug" required value={slug} onChange={(e) => setSlug(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-env-url">URL</Label>
            <Input id="edit-env-url" required value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-env-region">Region</Label>
              <Input id="edit-env-region" required value={region} onChange={(e) => setRegion(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-env-color">Barva</Label>
              <Input id="edit-env-color" type="color" value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-env-order">Pořadí</Label>
              <Input
                id="edit-env-order"
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                id="edit-env-prod"
                type="checkbox"
                checked={isProduction}
                onChange={(e) => setIsProduction(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="edit-env-prod">Produkční prostředí</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isBusy}>
              Zrušit
            </Button>
            <Button type="submit" disabled={isBusy}>
              {isBusy ? "Ukládám…" : "Uložit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  Delete Confirm Dialog                                              */
/* ------------------------------------------------------------------ */

function DeleteEnvDialog({
  env,
  onClose,
  onConfirm,
  pending,
}: {
  env: Environment;
  onClose: () => void;
  onConfirm: () => void;
  pending: string | null;
}) {
  const isBusy = pending === env.id;
  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Smazat prostředí</DialogTitle>
          <DialogDescription>
            Opravdu chceš smazat prostředí <strong>{env.name}</strong>? Tato akce je nevratná.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isBusy}>
            Zrušit
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isBusy}>
            {isBusy ? "Mažu…" : "Smazat"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  Add Form                                                           */
/* ------------------------------------------------------------------ */

function AddEnvForm({
  onAdded,
  onCancel,
}: {
  onAdded: (env: Environment) => void;
  onCancel: () => void;
}) {
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [region, setRegion] = React.useState("eu-central-1");
  const [color, setColor] = React.useState("#64748b");
  const [isProduction, setIsProduction] = React.useState(false);
  const [order, setOrder] = React.useState(0);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/environments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, url, region, color, isProduction, order }),
      });
      const body = (await res.json().catch(() => ({}))) as { item?: Environment; error?: string };
      if (!res.ok) {
        setError(body.error ?? "Uložení selhalo.");
        setPending(false);
        return;
      }
      onAdded(body.item!);
    } catch (err) {
      setError(`Výjimka: ${(err as Error).message}`);
      setPending(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="new-env-name">Název</Label>
          <Input id="new-env-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="staging" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-env-slug">Slug</Label>
          <Input id="new-env-slug" required value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="staging" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-env-url">URL</Label>
        <Input id="new-env-url" type="url" required value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://staging.example.com" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="new-env-region">Region</Label>
          <Input id="new-env-region" required value={region} onChange={(e) => setRegion(e.target.value)} placeholder="eu-central-1" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-env-color">Barva</Label>
          <Input id="new-env-color" type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="new-env-order">Pořadí</Label>
          <Input
            id="new-env-order"
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
          />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input
            id="new-env-prod"
            type="checkbox"
            checked={isProduction}
            onChange={(e) => setIsProduction(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          <Label htmlFor="new-env-prod">Produkční prostředí</Label>
        </div>
      </div>
      {error ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
          Zrušit
        </Button>
        <Button type="submit" disabled={pending} className="gap-1">
          <Plus className="h-4 w-4" />
          {pending ? "Ukládám…" : "Přidat"}
        </Button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function EnvsAdminClient({
  initialEnvs,
}: {
  initialEnvs: Environment[];
}) {
  const router = useRouter();
  const [envs, setEnvs] = React.useState<Environment[]>(initialEnvs);
  const [toast, setToast] = React.useState<ToastState>(null);
  const [pending, setPending] = React.useState<string | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const [editEnv, setEditEnv] = React.useState<Environment | null>(null);
  const [deleteEnv, setDeleteEnv] = React.useState<Environment | null>(null);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  async function patchEnv(id: string, patch: Partial<Environment>): Promise<boolean> {
    setPending(id);
    try {
      const res = await fetch(`/api/environments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const body = (await res.json().catch(() => ({}))) as Environment & { error?: string };
      if (!res.ok) {
        setToast({ kind: "error", message: body.error ?? "Uložení selhalo." });
        return false;
      }
      setEnvs((prev) => prev.map((e) => (e.id === id ? { ...e, ...body } : e)));
      setToast({ kind: "ok", message: "Uloženo." });
      router.refresh();
      return true;
    } finally {
      setPending(null);
    }
  }

  async function handleDelete(env: Environment) {
    setPending(env.id);
    try {
      const res = await fetch(`/api/environments/${env.id}`, { method: "DELETE" });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setToast({ kind: "error", message: body.error ?? "Smazání selhalo." });
        return;
      }
      setEnvs((prev) => prev.filter((e) => e.id !== env.id));
      setDeleteEnv(null);
      setToast({ kind: "ok", message: `Prostředí ${env.name} smazáno.` });
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  function handleAdded(created: Environment) {
    setEnvs((prev) => [...prev, created]);
    setAddOpen(false);
    setToast({ kind: "ok", message: `Prostředí ${created.name} přidáno.` });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {toast ? (
        <div
          role="status"
          className={
            toast.kind === "ok"
              ? "rounded-md border border-[hsl(var(--status-ok)/0.4)] bg-[hsl(var(--status-ok)/0.12)] px-3 py-2 text-sm text-[hsl(var(--status-ok))]"
              : "rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          }
        >
          {toast.message}
        </div>
      ) : null}

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Registrovaná prostředí ({envs.length})</CardTitle>
          <Button
            type="button"
            onClick={() => setAddOpen((v) => !v)}
            variant={addOpen ? "outline" : "default"}
          >
            {addOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {addOpen ? "Zavřít formulář" : "Přidat prostředí"}
          </Button>
        </CardHeader>
        {addOpen ? (
          <CardContent className="border-b border-border pb-6 pt-0">
            <div className="rounded-md border border-border bg-muted/30 p-4">
              <h3 className="mb-1 text-sm font-semibold">Nové prostředí</h3>
              <p className="mb-4 text-xs text-muted-foreground">
                Slug musí být jedinečný. URL musí být platná adresa.
              </p>
              <AddEnvForm onAdded={handleAdded} onCancel={() => setAddOpen(false)} />
            </div>
          </CardContent>
        ) : null}
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="w-28 pb-2 pr-4 font-medium">Název</th>
                  <th className="w-24 pb-2 pr-4 font-medium">Slug</th>
                  <th className="pb-2 pr-4 font-medium">URL</th>
                  <th className="w-28 pb-2 pr-4 font-medium">Region</th>
                  <th className="w-24 pb-2 pr-4 font-medium">Typ</th>
                  <th className="w-28 pb-2 font-medium">Akce</th>
                </tr>
              </thead>
              <tbody>
                {envs.map((env) => (
                  <tr key={env.id} className="border-t border-border/60">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-3 w-3 rounded-full"
                          style={{ backgroundColor: env.color }}
                        />
                        <span className="font-medium">{env.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">{env.slug}</td>
                    <td className="py-3 pr-4 text-xs text-muted-foreground">{env.url}</td>
                    <td className="py-3 pr-4 text-xs text-muted-foreground">{env.region}</td>
                    <td className="py-3 pr-4">
                      {env.isProduction ? (
                        <Badge variant="info">prod</Badge>
                      ) : (
                        <Badge variant="outline">non-prod</Badge>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={pending === env.id}
                          onClick={() => setEditEnv(env)}
                          title="Upravit prostředí"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          disabled={pending === env.id}
                          onClick={() => setDeleteEnv(env)}
                          title="Smazat prostředí"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {editEnv && (
        <EditEnvDialog
          key={editEnv.id}
          env={editEnv}
          onClose={() => setEditEnv(null)}
          onSave={patchEnv}
          pending={pending}
        />
      )}
      {deleteEnv && (
        <DeleteEnvDialog
          key={deleteEnv.id}
          env={deleteEnv}
          onClose={() => setDeleteEnv(null)}
          onConfirm={() => handleDelete(deleteEnv)}
          pending={pending}
        />
      )}
    </div>
  );
}
