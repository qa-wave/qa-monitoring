import Link from "next/link";
import { Bell } from "lucide-react";
import { PersonaFilter } from "./PersonaFilter";
import { EnvFilter } from "./EnvFilter";
import { UserMenu } from "./UserMenu";
import { ThemeSwitcher } from "./ThemeSwitcher";
import type { PersonaKey, UserRole } from "@/lib/types";
import type { StyleKey } from "@/lib/branding/types";
import { activeIncidents } from "@/data/incidents";
import { environments } from "@/data/environments";

export function Header({
  defaultPersona,
  user,
  currentStyle,
}: {
  defaultPersona: PersonaKey;
  user: { name: string; email: string; role: UserRole };
  currentStyle: StyleKey;
}) {
  const incidentCount = activeIncidents().length;
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur lg:px-6">
      <div className="flex flex-1 items-center gap-3">
        <EnvFilter environments={environments.map((e) => ({ slug: e.slug, name: e.name }))} />
        <PersonaFilter defaultPersona={defaultPersona} />
      </div>
      <div className="flex items-center gap-2">
        <ThemeSwitcher current={currentStyle} />
        <Link href="/incidents" className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent" aria-label="Notifikace">
          <Bell className="h-5 w-5" />
          {incidentCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {incidentCount}
            </span>
          ) : null}
        </Link>
        <UserMenu name={user.name} email={user.email} role={user.role} />
      </div>
    </header>
  );
}
