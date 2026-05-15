"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, KeyRound, Save, ShieldCheck, Eye, User as UserIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { PersonaKey, PublicUser } from "@/lib/types";
import { personaLabel } from "@/lib/personas";
import { getLocale, setLocale, type Locale } from "@/lib/i18n";

type ToastState = { kind: "ok" | "error"; message: string } | null;

const roleLabel: Record<string, string> = {
  admin: "Admin",
  viewer: "Viewer",
  operator: "Operator",
};

export function ProfileClient({ user }: { user: PublicUser }) {
  const router = useRouter();
  const locale = getLocale();

  /* ---- Personal info ---- */
  const [name, setName] = React.useState(user.name);
  const [nameEditing, setNameEditing] = React.useState(false);
  const [namePending, setNamePending] = React.useState(false);

  /* ---- Password ---- */
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [pwError, setPwError] = React.useState<string | null>(null);
  const [pwPending, setPwPending] = React.useState(false);

  /* ---- Preferences ---- */
  const [persona, setPersona] = React.useState<PersonaKey>(user.personaPreference);
  const [prefLocale, setPrefLocale] = React.useState<Locale>(locale);
  const [prefPending, setPrefPending] = React.useState(false);

  /* ---- Toast ---- */
  const [toast, setToast] = React.useState<ToastState>(null);
  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  /* ---- Helpers ---- */
  async function patchUser(patch: Record<string, unknown>): Promise<boolean> {
    const res = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setToast({ kind: "error", message: body.error ?? "Uložení selhalo." });
      return false;
    }
    return true;
  }

  /* ---- Save name ---- */
  async function handleSaveName() {
    if (!name.trim()) return;
    setNamePending(true);
    const ok = await patchUser({ name: name.trim() });
    setNamePending(false);
    if (ok) {
      setNameEditing(false);
      setToast({ kind: "ok", message: "Jméno uloženo." });
      router.refresh();
    }
  }

  /* ---- Save password ---- */
  async function handleSavePassword(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setPwError("Heslo musí mít alespoň 6 znaků.");
      return;
    }
    if (password !== confirm) {
      setPwError("Hesla se neshodují.");
      return;
    }
    setPwError(null);
    setPwPending(true);
    const ok = await patchUser({ password });
    setPwPending(false);
    if (ok) {
      setPassword("");
      setConfirm("");
      setToast({ kind: "ok", message: "Heslo změněno." });
    }
  }

  /* ---- Save preferences ---- */
  async function handleSavePreferences() {
    setPrefPending(true);
    const ok = await patchUser({ personaPreference: persona });
    if (ok && prefLocale !== locale) {
      setLocale(prefLocale);
    }
    setPrefPending(false);
    if (ok) {
      setToast({ kind: "ok", message: "Preference uloženy." });
      router.refresh();
    }
  }

  const prefsChanged = persona !== user.personaPreference || prefLocale !== locale;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Toast */}
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

      {/* Card 1: Personal info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            Osobní údaje
          </CardTitle>
          <CardDescription>Základní informace o tvém účtu.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="profile-name">Jméno</Label>
            {nameEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") {
                      setName(user.name);
                      setNameEditing(false);
                    }
                  }}
                />
                <Button
                  size="sm"
                  disabled={namePending || !name.trim()}
                  onClick={handleSaveName}
                >
                  {namePending ? "..." : <Check className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setName(user.name);
                    setNameEditing(false);
                  }}
                >
                  Zrušit
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{user.name}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs text-muted-foreground"
                  onClick={() => setNameEditing(true)}
                >
                  Upravit
                </Button>
              </div>
            )}
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label>E-mail</Label>
            <p className="text-sm font-mono text-muted-foreground">{user.email}</p>
          </div>

          {/* Role (read-only badge) */}
          <div className="space-y-2">
            <Label>Role</Label>
            <div>
              <Badge variant={user.role === "admin" ? "info" : "outline"} className="gap-1">
                {user.role === "admin" ? (
                  <ShieldCheck className="h-3 w-3" />
                ) : (
                  <Eye className="h-3 w-3" />
                )}
                {roleLabel[user.role] ?? user.role}
              </Badge>
              <p className="mt-1 text-xs text-muted-foreground">
                Roli může změnit pouze administrátor.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            Heslo
          </CardTitle>
          <CardDescription>Nastavení nového hesla pro tvůj účet.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSavePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-new-pw">Nové heslo</Label>
              <Input
                id="profile-new-pw"
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
              <Label htmlFor="profile-confirm-pw">Potvrzení hesla</Label>
              <Input
                id="profile-confirm-pw"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="zadej znovu"
              />
            </div>
            {pwError ? (
              <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {pwError}
              </p>
            ) : null}
            <Button type="submit" disabled={pwPending || !password}>
              {pwPending ? "Ukládám..." : "Změnit heslo"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Card 3: Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Preference
          </CardTitle>
          <CardDescription>Výchozí persona a jazyk rozhraní.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Persona</Label>
              <Select
                value={persona}
                onValueChange={(v: string) => setPersona(v as PersonaKey)}
              >
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
              <p className="text-xs text-muted-foreground">
                Určuje, které widgety a metriky vidíš na dashboardu.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Jazyk</Label>
              <Select
                value={prefLocale}
                onValueChange={(v: string) => setPrefLocale(v as Locale)}
              >
                <SelectTrigger>
                  <SelectValue>{prefLocale === "cs" ? "Čeština" : "English"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cs">Čeština</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Jazyk celého rozhraní.
              </p>
            </div>
          </div>
          <Button
            disabled={prefPending || !prefsChanged}
            onClick={handleSavePreferences}
          >
            {prefPending ? "Ukládám..." : "Uložit preference"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
