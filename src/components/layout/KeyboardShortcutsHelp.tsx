"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

/* ------------------------------------------------------------------ */
/*  Shortcut definitions                                               */
/* ------------------------------------------------------------------ */

interface Shortcut {
  keys: string[];
  /** Connector between keys: "then" for sequences, "+" for chords */
  connector?: "then" | "+";
  label: string;
}

const navigationShortcuts: Shortcut[] = [
  { keys: ["g", "h"], connector: "then", label: "Přehled" },
  { keys: ["g", "i"], connector: "then", label: "Incidenty" },
  { keys: ["g", "t"], connector: "then", label: "Testy" },
  { keys: ["g", "r"], connector: "then", label: "Releasy" },
  { keys: ["g", "e"], connector: "then", label: "Prostředí" },
  { keys: ["g", "a"], connector: "then", label: "Aplikace" },
  { keys: ["g", "q"], connector: "then", label: "Kvalita" },
  { keys: ["g", "p"], connector: "then", label: "Produkt" },
  { keys: ["g", "s"], connector: "then", label: "Veřejný status" },
];

const actionShortcuts: Shortcut[] = [
  { keys: ["⌘", "K"], connector: "+", label: "Vyhledávání" },
  { keys: ["?"], label: "Klávesové zkratky" },
  { keys: ["Esc"], label: "Zavřít dialog" },
];

/* ------------------------------------------------------------------ */
/*  Kbd badge                                                          */
/* ------------------------------------------------------------------ */

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex min-w-[22px] items-center justify-center rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] leading-none text-muted-foreground">
      {children}
    </kbd>
  );
}

/* ------------------------------------------------------------------ */
/*  Shortcut row                                                       */
/* ------------------------------------------------------------------ */

function ShortcutRow({ shortcut }: { shortcut: Shortcut }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-sm text-foreground">{shortcut.label}</span>
      <div className="flex shrink-0 items-center gap-1">
        {shortcut.keys.map((key, i) => (
          <React.Fragment key={i}>
            {i > 0 && shortcut.connector && (
              <span className="text-[10px] text-muted-foreground">
                {shortcut.connector === "then" ? "pak" : "+"}
              </span>
            )}
            <Kbd>{key}</Kbd>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section                                                            */
/* ------------------------------------------------------------------ */

function Section({
  title,
  shortcuts,
}: {
  title: string;
  shortcuts: Shortcut[];
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <div className="divide-y divide-border/50">
        {shortcuts.map((s, i) => (
          <ShortcutRow key={i} shortcut={s} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function KeyboardShortcutsHelp({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 p-0 sm:rounded-xl">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle className="text-base font-semibold">
            Klávesové zkratky
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Stiskni zkratku kdekoliv v aplikaci (mimo textová pole).
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 px-6 py-5 sm:grid-cols-2">
          <Section title="Navigace" shortcuts={navigationShortcuts} />
          <Section title="Akce" shortcuts={actionShortcuts} />
        </div>

        <div className="border-t border-border px-6 py-3">
          <p className="text-[11px] text-muted-foreground">
            <Kbd>g</Kbd>{" "}
            <span className="ml-1">
              zahájí navigační sekvenci — stiskni další klávesu do 1 s.
            </span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
