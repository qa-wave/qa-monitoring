"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Eye, KeyRound, Pencil, Plus, ShieldCheck, Trash2, UserPlus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PersonaKey, PublicUser, UserRole } from "@/lib/types";

type User = PublicUser;
import { personaLabel } from "@/lib/personas";

type ToastState = { kind: "ok" | "error"; message: string } | null;

/* ------------------------------------------------------------------ */
/*  Dialog components — defined OUTSIDE main component                */
/* ------------------------------------------------------------------ */

function EditUserDialog({
  user,
  onClose,
  onSave,
  pending,
}: {
  user: User;
  onClose: () => void;
  onSave: (id: string, patch: Partial<User>) => Promise<boolean>;
  pending: string | null;
}) {
  const [name, setName] = React.useState(user.name);
  const [role, setRole] = React.useState<UserRole>(user.role);
  const [persona, setPersona] = React.useState<PersonaKey>(user.personaPreference);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await onSave(user.id, { name, role, personaPreference: persona });
    if (ok) onClose();
  }

  const isBusy = pending === user.id;

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upravit uživatele</DialogTitle>
          <DialogDescription>
            Změň jméno, roli nebo personu uživatele {user.email}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Jméno</Label>
            <Input
              id="edit-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v: string) => setRole(v as UserRole)}>
                <SelectTrigger>
                  <SelectValue>{role}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">viewer</SelectItem>
                  <SelectItem value="admin">admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Persona</Label>
              <Select value={persona} onValueChange={(v: string) => setPersona(v as PersonaKey)}>
                <SelectTrigger>
                  <SelectValue>{personaLabel[persona]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{personaLabel.all}</SelectItem>
                  <SelectItem value="dev">{personaLabel.dev}</SelectItem>
                  <SelectItem value="po">{personaLabel.po}</SelectItem>
                  <SelectItem value="tester">{personaLabel.tester}</SelectItem>
                </SelectContent>
              </Select>
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

function ChangePasswordDialog({
  user,
  onClose,
  onSave,
  pending,
}: {
  user: User;
  onClose: () => void;
  onSave: (id: string, password: string) => Promise<boolean>;
  pending: string | null;
}) {
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError("Heslo musí mít alespoň 6 znaků.");
      return;
    }
    if (password !== confirm) {
      setError("Hesla se neshodují.");
      return;
    }
    setError(null);
    const ok = await onSave(user.id, password);
    if (ok) onClose();
  }

  const isBusy = pending === user.id;

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Změnit heslo</DialogTitle>
          <DialogDescription>
            Nastavení nového hesla pro {user.name} ({user.email}).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-pw">Nové heslo</Label>
            <Input
              id="new-pw"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="minimálně 6 znaků"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-pw">Potvrzení hesla</Label>
            <Input
              id="confirm-pw"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="zadej znovu"
            />
          </div>
          {error ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isBusy}>
              Zrušit
            </Button>
            <Button type="submit" disabled={isBusy}>
              {isBusy ? "Ukládám…" : "Změnit heslo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteUserConfirmDialog({
  user,
  onClose,
  onConfirm,
  pending,
}: {
  user: User;
  onClose: () => void;
  onConfirm: () => void;
  pending: string | null;
}) {
  const isBusy = pending === user.id;

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Smazat uživatele</DialogTitle>
          <DialogDescription>
            Opravdu chceš smazat uživatele <strong>{user.name}</strong> ({user.email})? Tato akce
            je nevratná.
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
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function UsersAdminClient({
  initialUsers,
  currentUserId,
}: {
  initialUsers: User[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [users, setUsers] = React.useState<User[]>(initialUsers);
  const [toast, setToast] = React.useState<ToastState>(null);
  const [pending, setPending] = React.useState<string | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);

  const [editUser, setEditUser] = React.useState<User | null>(null);
  const [passwordUser, setPasswordUser] = React.useState<User | null>(null);
  const [deleteUser, setDeleteUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const adminCount = users.filter((u) => u.role === "admin").length;

  async function patchUser(id: string, patch: Partial<User>): Promise<boolean> {
    setPending(id);
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setToast({ kind: "error", message: body.error ?? "Uložení selhalo." });
        return false;
      }
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
      setToast({ kind: "ok", message: "Uloženo." });
      router.refresh();
      return true;
    } finally {
      setPending(null);
    }
  }

  async function changePassword(id: string, password: string): Promise<boolean> {
    setPending(id);
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setToast({ kind: "error", message: body.error ?? "Změna hesla selhala." });
        return false;
      }
      setToast({ kind: "ok", message: "Heslo změněno." });
      return true;
    } finally {
      setPending(null);
    }
  }

  async function handleDelete(user: User) {
    setPending(user.id);
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setToast({ kind: "error", message: body.error ?? "Smazání selhalo." });
        return;
      }
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setDeleteUser(null);
      setToast({ kind: "ok", message: `Uživatel ${user.name} smazán.` });
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  function handleAdded(created: User) {
    setUsers((prev) => [...prev, created]);
    setAddOpen(false);
    setToast({ kind: "ok", message: `Uživatel ${created.name} přidán.` });
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
          <div>
            <CardTitle>Registrovaní uživatelé ({users.length})</CardTitle>
            <p className="text-xs text-muted-foreground">
              Adminů: {adminCount} · viewerů: {users.length - adminCount}
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setAddOpen((v) => !v)}
            variant={addOpen ? "outline" : "default"}
          >
            {addOpen ? <X className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {addOpen ? "Zavřít formulář" : "Přidat uživatele"}
          </Button>
        </CardHeader>
        {addOpen ? (
          <CardContent className="border-b border-border pb-6 pt-0">
            <div className="rounded-md border border-border bg-muted/30 p-4">
              <h3 className="mb-1 text-sm font-semibold">Nový uživatel</h3>
              <p className="mb-4 text-xs text-muted-foreground">
                E-mail musí být jedinečný. Role lze kdykoli změnit později.
              </p>
              <AddUserForm onAdded={handleAdded} onCancel={() => setAddOpen(false)} />
            </div>
          </CardContent>
        ) : null}
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="w-48 pb-2 pr-4 font-medium">Jméno</th>
                  <th className="pb-2 pr-4 font-medium">E-mail</th>
                  <th className="w-36 pb-2 font-medium">Role</th>
                  <th className="w-40 pb-2 font-medium">Persona</th>
                  <th className="w-36 pb-2 font-medium">Akce</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u.id === currentUserId;
                  const isOnlyAdmin = u.role === "admin" && adminCount <= 1;
                  const disableDelete = isSelf || isOnlyAdmin;
                  return (
                    <tr key={u.id} className="border-t border-border/60">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{u.name}</span>
                          {isSelf ? <Badge variant="outline">ty</Badge> : null}
                        </div>
                      </td>
                      <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">{u.email}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={u.role === "admin" ? "info" : "outline"} className="gap-1">
                          {u.role === "admin" ? <ShieldCheck className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          {u.role === "admin" ? "Admin" : "Viewer"}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant="outline" className="text-xs font-normal">
                          {personaLabel[u.personaPreference]}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={pending === u.id}
                            onClick={() => setEditUser(u)}
                            title="Upravit uživatele"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={pending === u.id}
                            onClick={() => setPasswordUser(u)}
                            title="Změnit heslo"
                          >
                            <KeyRound className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            disabled={disableDelete || pending === u.id}
                            onClick={() => setDeleteUser(u)}
                            title={
                              isSelf
                                ? "Sebe smazat nemůžeš"
                                : isOnlyAdmin
                                ? "Posledního admina nelze smazat"
                                : "Smazat uživatele"
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            <strong className="font-semibold">Pravidla:</strong> Sama/sám sobě role nebo přístup odebrat nemůžeš.
            Posledního administrátora nelze degradovat ani smazat, jinak by systém zůstal bez správce.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role a oprávnění</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-0 text-sm">
          <div className="flex items-start gap-3">
            <Badge variant="info" className="mt-0.5">admin</Badge>
            <div>
              <div className="font-medium">Administrátor</div>
              <p className="text-xs text-muted-foreground">
                Plný přístup včetně Nastavení (integrace, aplikace, prostředí, uživatelé). Může provádět
                akce na jakékoli stránce.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-0.5">viewer</Badge>
            <div>
              <div className="font-medium">Čtenář</div>
              <p className="text-xs text-muted-foreground">
                Vidí celý dashboard (Přehled, Prostředí, Aplikace, Testy, Incidenty, veřejný Status), ale
                nedostane se do /admin sekcí.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs — conditionally mounted with key for state reset */}
      {editUser && (
        <EditUserDialog
          key={editUser.id}
          user={editUser}
          onClose={() => setEditUser(null)}
          onSave={patchUser}
          pending={pending}
        />
      )}
      {passwordUser && (
        <ChangePasswordDialog
          key={passwordUser.id}
          user={passwordUser}
          onClose={() => setPasswordUser(null)}
          onSave={changePassword}
          pending={pending}
        />
      )}
      {deleteUser && (
        <DeleteUserConfirmDialog
          key={deleteUser.id}
          user={deleteUser}
          onClose={() => setDeleteUser(null)}
          onConfirm={() => handleDelete(deleteUser)}
          pending={pending}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Add User form                                                      */
/* ------------------------------------------------------------------ */

function AddUserForm({
  onAdded,
  onCancel,
}: {
  onAdded: (user: User) => void;
  onCancel: () => void;
}) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<UserRole>("viewer");
  const [persona, setPersona] = React.useState<PersonaKey>("dev");
  const [password, setPassword] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError("Heslo musí mít alespoň 6 znaků.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role, personaPreference: persona, password }),
      });
      const body = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
      if (!res.ok) {
        setError(body.error ?? "Uložení selhalo.");
        setPending(false);
        return;
      }
      onAdded({
        id: body.id!,
        name,
        email,
        role,
        personaPreference: persona,
      });
    } catch (err) {
      setError(`Výjimka: ${(err as Error).message}`);
      setPending(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div className="space-y-2">
        <Label htmlFor="new-name">Jméno</Label>
        <Input id="new-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jana Nová" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-email">E-mail</Label>
        <Input
          id="new-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jana@example.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-password">Počáteční heslo</Label>
        <Input
          id="new-password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="minimálně 6 znaků"
          autoComplete="new-password"
        />
        <p className="text-xs text-muted-foreground">
          Uživatel si ho po prvním přihlášení může změnit (feature v1).
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Role</Label>
          <Select value={role} onValueChange={(v: string) => setRole(v as UserRole)}>
            <SelectTrigger>
              <SelectValue>{role}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="viewer">viewer</SelectItem>
              <SelectItem value="admin">admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Persona</Label>
          <Select value={persona} onValueChange={(v: string) => setPersona(v as PersonaKey)}>
            <SelectTrigger>
              <SelectValue>{personaLabel[persona]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{personaLabel.all}</SelectItem>
              <SelectItem value="dev">{personaLabel.dev}</SelectItem>
              <SelectItem value="po">{personaLabel.po}</SelectItem>
              <SelectItem value="tester">{personaLabel.tester}</SelectItem>
            </SelectContent>
          </Select>
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
