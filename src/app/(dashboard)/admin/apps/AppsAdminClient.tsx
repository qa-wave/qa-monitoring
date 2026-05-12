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
import type { Application } from "@/lib/types";

type ToastState = { kind: "ok" | "error"; message: string } | null;

/* ------------------------------------------------------------------ */
/*  Edit Dialog                                                        */
/* ------------------------------------------------------------------ */

function EditAppDialog({
  app,
  onClose,
  onSave,
  pending,
}: {
  app: Application;
  onClose: () => void;
  onSave: (id: string, patch: Partial<Application>) => Promise<boolean>;
  pending: string | null;
}) {
  const [name, setName] = React.useState(app.name);
  const [slug, setSlug] = React.useState(app.slug);
  const [language, setLanguage] = React.useState(app.language);
  const [description, setDescription] = React.useState(app.description);
  const [repoUrl, setRepoUrl] = React.useState(app.repoUrl);
  const [owners, setOwners] = React.useState(app.owners.join(", "));
  const [tags, setTags] = React.useState(app.tags.join(", "));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await onSave(app.id, {
      name,
      slug,
      language,
      description,
      repoUrl,
      owners: owners
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      tags: tags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
    if (ok) onClose();
  }

  const isBusy = pending === app.id;

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upravit aplikaci</DialogTitle>
          <DialogDescription>
            Uprav vlastnosti aplikace {app.name}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-app-name">Název</Label>
              <Input id="edit-app-name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-app-slug">Slug</Label>
              <Input id="edit-app-slug" required value={slug} onChange={(e) => setSlug(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-app-lang">Jazyk</Label>
              <Input id="edit-app-lang" required value={language} onChange={(e) => setLanguage(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-app-repo">Repo URL</Label>
              <Input id="edit-app-repo" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-app-desc">Popis</Label>
            <Input id="edit-app-desc" required value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-app-owners">Owners (oddelene carkou)</Label>
              <Input id="edit-app-owners" value={owners} onChange={(e) => setOwners(e.target.value)} placeholder="team-a, team-b" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-app-tags">Tagy (oddelene carkou)</Label>
              <Input id="edit-app-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="backend, api" />
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

function DeleteAppDialog({
  app,
  onClose,
  onConfirm,
  pending,
}: {
  app: Application;
  onClose: () => void;
  onConfirm: () => void;
  pending: string | null;
}) {
  const isBusy = pending === app.id;
  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Smazat aplikaci</DialogTitle>
          <DialogDescription>
            Opravdu chceš smazat aplikaci <strong>{app.name}</strong>? Tato akce je nevratná.
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

function AddAppForm({
  onAdded,
  onCancel,
}: {
  onAdded: (app: Application) => void;
  onCancel: () => void;
}) {
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [language, setLanguage] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [repoUrl, setRepoUrl] = React.useState("");
  const [owners, setOwners] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          language,
          description,
          repoUrl: repoUrl || "",
          owners: owners
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          tags: tags
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          environmentIds: [],
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { item?: Application; error?: string };
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
          <Label htmlFor="new-app-name">Název</Label>
          <Input id="new-app-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="web" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-app-slug">Slug</Label>
          <Input id="new-app-slug" required value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="web" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="new-app-lang">Jazyk</Label>
          <Input id="new-app-lang" required value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="TypeScript" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-app-repo">Repo URL</Label>
          <Input id="new-app-repo" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/..." />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-app-desc">Popis</Label>
        <Input id="new-app-desc" required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Hlavní webová aplikace" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="new-app-owners">Owners (oddelene carkou)</Label>
          <Input id="new-app-owners" value={owners} onChange={(e) => setOwners(e.target.value)} placeholder="frontend-team" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-app-tags">Tagy (oddelene carkou)</Label>
          <Input id="new-app-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="frontend, customer-facing" />
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

export function AppsAdminClient({
  initialApps,
}: {
  initialApps: Application[];
}) {
  const router = useRouter();
  const [apps, setApps] = React.useState<Application[]>(initialApps);
  const [toast, setToast] = React.useState<ToastState>(null);
  const [pending, setPending] = React.useState<string | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const [editApp, setEditApp] = React.useState<Application | null>(null);
  const [deleteApp, setDeleteApp] = React.useState<Application | null>(null);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  async function patchApp(id: string, patch: Partial<Application>): Promise<boolean> {
    setPending(id);
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const body = (await res.json().catch(() => ({}))) as Application & { error?: string };
      if (!res.ok) {
        setToast({ kind: "error", message: body.error ?? "Uložení selhalo." });
        return false;
      }
      setApps((prev) => prev.map((a) => (a.id === id ? { ...a, ...body } : a)));
      setToast({ kind: "ok", message: "Uloženo." });
      router.refresh();
      return true;
    } finally {
      setPending(null);
    }
  }

  async function handleDelete(app: Application) {
    setPending(app.id);
    try {
      const res = await fetch(`/api/applications/${app.id}`, { method: "DELETE" });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setToast({ kind: "error", message: body.error ?? "Smazání selhalo." });
        return;
      }
      setApps((prev) => prev.filter((a) => a.id !== app.id));
      setDeleteApp(null);
      setToast({ kind: "ok", message: `Aplikace ${app.name} smazána.` });
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  function handleAdded(created: Application) {
    setApps((prev) => [...prev, created]);
    setAddOpen(false);
    setToast({ kind: "ok", message: `Aplikace ${created.name} přidána.` });
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
          <CardTitle>Registrované aplikace ({apps.length})</CardTitle>
          <Button
            type="button"
            onClick={() => setAddOpen((v) => !v)}
            variant={addOpen ? "outline" : "default"}
          >
            {addOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {addOpen ? "Zavřít formulář" : "Přidat aplikaci"}
          </Button>
        </CardHeader>
        {addOpen ? (
          <CardContent className="border-b border-border pb-6 pt-0">
            <div className="rounded-md border border-border bg-muted/30 p-4">
              <h3 className="mb-1 text-sm font-semibold">Nová aplikace</h3>
              <p className="mb-4 text-xs text-muted-foreground">
                Slug musí být jedinečný. Všechna pole kromě Repo URL a owners/tags jsou povinná.
              </p>
              <AddAppForm onAdded={handleAdded} onCancel={() => setAddOpen(false)} />
            </div>
          </CardContent>
        ) : null}
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="w-36 pb-2 pr-4 font-medium">Název</th>
                  <th className="w-28 pb-2 pr-4 font-medium">Slug</th>
                  <th className="w-28 pb-2 pr-4 font-medium">Jazyk</th>
                  <th className="pb-2 pr-4 font-medium">Owners</th>
                  <th className="w-28 pb-2 font-medium">Akce</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((app) => (
                  <tr key={app.id} className="border-t border-border/60">
                    <td className="py-3 pr-4 font-medium">{app.name}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">{app.slug}</td>
                    <td className="py-3 pr-4">
                      <Badge variant="outline">{app.language}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-xs text-muted-foreground">
                      {app.owners.join(", ")}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={pending === app.id}
                          onClick={() => setEditApp(app)}
                          title="Upravit aplikaci"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          disabled={pending === app.id}
                          onClick={() => setDeleteApp(app)}
                          title="Smazat aplikaci"
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

      {editApp && (
        <EditAppDialog
          key={editApp.id}
          app={editApp}
          onClose={() => setEditApp(null)}
          onSave={patchApp}
          pending={pending}
        />
      )}
      {deleteApp && (
        <DeleteAppDialog
          key={deleteApp.id}
          app={deleteApp}
          onClose={() => setDeleteApp(null)}
          onConfirm={() => handleDelete(deleteApp)}
          pending={pending}
        />
      )}
    </div>
  );
}
