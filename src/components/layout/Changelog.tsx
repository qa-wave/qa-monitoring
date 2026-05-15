"use client";

import * as React from "react";
import {
  Sparkles,
  ArrowUpCircle,
  Wrench,
  Circle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const CURRENT_VERSION = "0.5.0";
const LS_KEY = "changelog-last-seen";

type ChangeType = "feature" | "improvement" | "fix";

interface ChangeItem {
  type: ChangeType;
  text: string;
}

interface ChangelogEntry {
  version: string;
  date: string;
  changes: ChangeItem[];
}

const typeConfig: Record<
  ChangeType | "default",
  { icon: React.ElementType; color: string }
> = {
  feature: { icon: Sparkles, color: "text-emerald-500" },
  improvement: { icon: ArrowUpCircle, color: "text-blue-500" },
  fix: { icon: Wrench, color: "text-orange-500" },
  default: { icon: Circle, color: "text-muted-foreground" },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const entries: ChangelogEntry[] = [
  {
    version: "0.5.0",
    date: "2026-05-14",
    changes: [
      { type: "feature", text: "Vylepšený changelog — typové ikony, verze, New badge" },
      { type: "improvement", text: "Sidebar redesign — kompaktnější navigace" },
      { type: "fix", text: "Oprava zobrazení grafů při prvním načtení dashboardu" },
    ],
  },
  {
    version: "0.4.0",
    date: "2026-05-09",
    changes: [
      { type: "feature", text: "PWA podpora — nainstaluj si Beacon jako nativní aplikaci" },
      { type: "feature", text: "Audit log — nová admin stránka s přehledem akcí" },
      { type: "improvement", text: "CSV export zranitelností na stránce Kvalita" },
      { type: "fix", text: "Changelog modal — opraveno zobrazení na mobilech" },
    ],
  },
  {
    version: "0.3.0",
    date: "2026-04-17",
    changes: [
      { type: "feature", text: "SDLC integrace — správa providerů v Admin sekci" },
      { type: "feature", text: "Branding — 3 barvy + 5 vizuálních stylů" },
      { type: "improvement", text: "ČEPS paleta jako výchozí preset" },
    ],
  },
  {
    version: "0.2.0",
    date: "2026-04-10",
    changes: [
      { type: "feature", text: "Veřejná status page s plánovanou údržbou" },
      { type: "improvement", text: "Správa prostředí a aplikací v Admin sekci" },
      { type: "feature", text: "Bezpečnostní zranitelnosti — nová stránka Kvalita" },
    ],
  },
];

export function Changelog() {
  const [open, setOpen] = React.useState(false);
  const [lastSeen, setLastSeen] = React.useState<string | null>(() => {
    if (typeof window === "undefined") return CURRENT_VERSION;
    return localStorage.getItem(LS_KEY);
  });
  const showBadge = lastSeen !== CURRENT_VERSION;

  function handleOpen() {
    setOpen(true);
    setLastSeen(CURRENT_VERSION);
    localStorage.setItem(LS_KEY, CURRENT_VERSION);
  }

  function isNewEntry(version: string) {
    if (!lastSeen) return true;
    return version > lastSeen;
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="relative inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span>Co je nového</span>
        {showBadge && (
          <span className="absolute -top-1 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[hsl(var(--brand-primary))] px-1 text-[10px] font-bold text-white">
            !
          </span>
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Co je nového</DialogTitle>
            <DialogDescription>
              Přehled posledních změn v aplikaci.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-2">
            {entries.map((entry, idx) => (
              <div key={entry.version}>
                {/* Date + version header */}
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="text-sm font-bold text-[hsl(var(--brand-primary))]">
                    {formatDate(entry.date)}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-mono font-semibold text-muted-foreground">
                    v{entry.version}
                  </span>
                  {isNewEntry(entry.version) && idx === 0 && (
                    <span className="inline-flex items-center rounded-full bg-[hsl(var(--brand-primary))] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      New
                    </span>
                  )}
                </div>

                {/* Change items with typed icons */}
                <ul className="space-y-2">
                  {entry.changes.map((change, i) => {
                    const cfg =
                      typeConfig[change.type] ?? typeConfig.default;
                    const Icon = cfg.icon;
                    return (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-foreground/80"
                      >
                        <Icon
                          className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${cfg.color}`}
                        />
                        <span>{change.text}</span>
                      </li>
                    );
                  })}
                </ul>

                {/* Separator between entries */}
                {idx < entries.length - 1 && (
                  <div className="mt-5 border-t border-border/50" />
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
