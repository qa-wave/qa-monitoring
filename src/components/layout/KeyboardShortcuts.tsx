"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Keyboard } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const shortcuts = [
  { keys: ["g", "h"], label: "Přehled (Home)", href: "/" },
  { keys: ["g", "i"], label: "Incidenty", href: "/incidents" },
  { keys: ["g", "t"], label: "Testy", href: "/tests" },
  { keys: ["g", "r"], label: "Releasy", href: "/releases" },
  { keys: ["g", "e"], label: "Prostředí", href: "/environments" },
  { keys: ["g", "a"], label: "Aplikace", href: "/applications" },
  { keys: ["g", "q"], label: "Kvalita", href: "/quality" },
] as const;

export function KeyboardShortcuts() {
  const router = useRouter();
  const [pendingKey, setPendingKey] = React.useState<string | null>(null);
  const [helpOpen, setHelpOpen] = React.useState(false);
  const pendingTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      /* Ignore when typing in inputs */
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.target as HTMLElement)?.isContentEditable) return;

      /* Ignore if modifier keys are held (except shift for ?) */
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key;

      /* ? opens help */
      if (key === "?") {
        e.preventDefault();
        setHelpOpen(true);
        return;
      }

      /* First key of combo */
      if (key === "g" && !pendingKey) {
        setPendingKey("g");
        if (pendingTimeout.current) clearTimeout(pendingTimeout.current);
        pendingTimeout.current = setTimeout(() => setPendingKey(null), 1000);
        return;
      }

      /* Second key of combo */
      if (pendingKey === "g") {
        const match = shortcuts.find((s) => s.keys[1] === key);
        if (match) {
          e.preventDefault();
          router.push(match.href);
        }
        setPendingKey(null);
        if (pendingTimeout.current) clearTimeout(pendingTimeout.current);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [pendingKey, router]);

  /* Cleanup timeout on unmount */
  React.useEffect(() => {
    return () => {
      if (pendingTimeout.current) clearTimeout(pendingTimeout.current);
    };
  }, []);

  return (
    <>
      {/* Floating help button */}
      <button
        onClick={() => setHelpOpen(true)}
        className="fixed bottom-4 left-4 z-40 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-md transition-colors hover:bg-accent hover:text-foreground lg:bottom-6 lg:left-6"
        aria-label="Klávesové zkratky"
      >
        <Keyboard className="h-4 w-4" />
      </button>

      {/* Pending indicator */}
      {pendingKey && (
        <div className="fixed bottom-14 left-4 z-40 rounded-md border border-border bg-card px-2 py-1 text-xs text-muted-foreground shadow-md lg:bottom-16 lg:left-6">
          <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">g</kbd>
          <span className="ml-1">...</span>
        </div>
      )}

      {/* Help dialog */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="max-w-sm">
          <DialogTitle className="text-base font-semibold">Klávesové zkratky</DialogTitle>

          <div className="mt-2 space-y-3">
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Navigace
              </p>
              <div className="space-y-1">
                {shortcuts.map((s) => (
                  <div key={s.href} className="flex items-center justify-between text-sm">
                    <span>{s.label}</span>
                    <div className="flex items-center gap-1">
                      {s.keys.map((k) => (
                        <kbd
                          key={k}
                          className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Obecné
              </p>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>Vyhledávání</span>
                  <div className="flex items-center gap-1">
                    <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                      ⌘
                    </kbd>
                    <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                      K
                    </kbd>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Tato nápověda</span>
                  <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                    ?
                  </kbd>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
