"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const CURRENT_VERSION = "0.4.0";
const LS_KEY = "changelog-last-seen";

interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

const entries: ChangelogEntry[] = [
  {
    version: "0.4.0",
    date: "2026-05-09",
    changes: [
      "PWA podpora — nainstaluj si Beacon jako nativní aplikaci",
      "CSV export zranitelností na stránce Kvalita",
      "Audit log — nová admin stránka s přehledem akcí",
      "Changelog modal — tohle právě čteš",
    ],
  },
  {
    version: "0.3.0",
    date: "2026-04-17",
    changes: [
      "SDLC integrace — správa providerů v Admin sekci",
      "Branding — 3 barvy + 5 vizuálních stylů",
      "ČEPS paleta jako výchozí preset",
    ],
  },
  {
    version: "0.2.0",
    date: "2026-04-10",
    changes: [
      "Veřejná status page s plánovanou údržbou",
      "Správa prostředí a aplikací v Admin sekci",
      "Bezpečnostní zranitelnosti — nová stránka Kvalita",
    ],
  },
];

export function Changelog() {
  const [open, setOpen] = React.useState(false);
  const [showBadge, setShowBadge] = React.useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(LS_KEY) !== CURRENT_VERSION;
  });

  function handleOpen() {
    setOpen(true);
    setShowBadge(false);
    localStorage.setItem(LS_KEY, CURRENT_VERSION);
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
            {entries.map((entry) => (
              <div key={entry.version}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold">
                    v{entry.version}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {entry.date}
                  </span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {entry.changes.map((change, i) => (
                    <li key={i}>{change}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
