import { PersonaFilter } from "./PersonaFilter";
import { SearchTrigger } from "./SearchTrigger";
import { EnvFilter } from "./EnvFilter";
import { SavedViews } from "./SavedViews";
import { UserMenu } from "./UserMenu";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { NotificationDropdown } from "./NotificationDropdown";
import type { PersonaKey, UserRole } from "@/lib/types";
import type { StyleKey } from "@/lib/branding/types";
import type { Locale } from "@/lib/i18n";
import { LiveIndicator } from "./LiveIndicator";
import { activeIncidents } from "@/data/incidents";
import { environments } from "@/data/environments";

export function Header({
  defaultPersona,
  user,
  currentStyle,
  locale,
}: {
  defaultPersona: PersonaKey;
  user: { name: string; email: string; role: UserRole };
  currentStyle: StyleKey;
  locale: Locale;
}) {
  const active = activeIncidents();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur lg:px-6">
      <div className="flex flex-1 items-center gap-3">
        <EnvFilter environments={environments.map((e) => ({ slug: e.slug, name: e.name }))} />
        <PersonaFilter defaultPersona={defaultPersona} />
        <SavedViews />
      </div>
      <SearchTrigger />
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-muted/20 px-1">
          <LocaleSwitcher current={locale} />
          <ThemeSwitcher current={currentStyle} />
        </div>
        <LiveIndicator />
        <NotificationDropdown
          incidents={active.map((i) => ({
            id: i.id,
            title: i.title,
            severity: i.severity,
            startedAt: i.startedAt,
            status: i.status,
          }))}
        />
        <UserMenu name={user.name} email={user.email} role={user.role} />
      </div>
    </header>
  );
}
