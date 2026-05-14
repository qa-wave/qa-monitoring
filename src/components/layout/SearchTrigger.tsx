"use client";

import { Search } from "lucide-react";

export function SearchTrigger() {
  return (
    <button
      type="button"
      onClick={() =>
        document.dispatchEvent(
          new KeyboardEvent("keydown", { key: "k", metaKey: true })
        )
      }
      className="hidden sm:flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <Search className="h-3.5 w-3.5" />
      <span>Hledat…</span>
      <kbd className="ml-2 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">
        ⌘K
      </kbd>
    </button>
  );
}
