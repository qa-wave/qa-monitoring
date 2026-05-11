"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  AppWindow,
  BarChart3,
  Boxes,
  Globe,
  LayoutDashboard,
  Palette,
  Rocket,
  Search,
  Server,
  Settings,
  ShieldCheck,
  TestTube2,
  Users,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { applications } from "@/data/applications";
import type { UserRole } from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CommandItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  category: string;
  adminOnly?: boolean;
  keywords?: string;
}

/* ------------------------------------------------------------------ */
/*  Item definitions                                                   */
/* ------------------------------------------------------------------ */

const navItems: CommandItem[] = [
  { id: "nav-home", label: "Přehled", href: "/", icon: LayoutDashboard, category: "Navigace", keywords: "dashboard home domů" },
  { id: "nav-envs", label: "Prostředí", href: "/environments", icon: Globe, category: "Navigace", keywords: "environments" },
  { id: "nav-apps", label: "Aplikace", href: "/applications", icon: Boxes, category: "Navigace", keywords: "applications" },
  { id: "nav-releases", label: "Releasy", href: "/releases", icon: Rocket, category: "Navigace", keywords: "releases" },
  { id: "nav-tests", label: "Testy", href: "/tests", icon: TestTube2, category: "Navigace", keywords: "tests" },
  { id: "nav-incidents", label: "Incidenty", href: "/incidents", icon: AlertTriangle, category: "Navigace", keywords: "incidents" },
  { id: "nav-quality", label: "Kvalita & bezpečnost", href: "/quality", icon: ShieldCheck, category: "Navigace", keywords: "quality security" },
  { id: "nav-product", label: "Produkt", href: "/product", icon: BarChart3, category: "Navigace", keywords: "product" },
  { id: "nav-status", label: "Veřejný status", href: "/status/preview", icon: Activity, category: "Navigace", keywords: "status public" },
];

const adminItems: CommandItem[] = [
  { id: "admin-integrations", label: "Integrace", href: "/admin/integrations", icon: Settings, category: "Administrace", adminOnly: true, keywords: "integrations sdlc" },
  { id: "admin-branding", label: "Vzhled", href: "/admin/branding", icon: Palette, category: "Administrace", adminOnly: true, keywords: "branding colors barvy styl" },
  { id: "admin-users", label: "Uživatelé", href: "/admin/users", icon: Users, category: "Administrace", adminOnly: true, keywords: "users" },
  { id: "admin-envs", label: "Správa prostředí", href: "/admin/environments", icon: Server, category: "Administrace", adminOnly: true, keywords: "environments manage" },
  { id: "admin-apps", label: "Správa aplikací", href: "/admin/apps", icon: Boxes, category: "Administrace", adminOnly: true, keywords: "applications manage" },
];

const appItems: CommandItem[] = applications.map((app) => ({
  id: `app-${app.slug}`,
  label: app.name,
  href: `/applications/${app.slug}`,
  icon: AppWindow,
  category: "Aplikace",
  keywords: `${app.description} ${app.language} ${app.tags.join(" ")}`,
}));

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function CommandPalette({ role }: { role: UserRole }) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const listRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();

  /* Build item list based on role */
  const allItems = React.useMemo(() => {
    const items = [...navItems];
    if (role === "admin") items.push(...adminItems);
    items.push(...appItems);
    return items;
  }, [role]);

  /* Filter */
  const filtered = React.useMemo(() => {
    if (!query.trim()) return allItems;
    const q = query.toLowerCase();
    return allItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.href.toLowerCase().includes(q) ||
        item.keywords?.toLowerCase().includes(q)
    );
  }, [query, allItems]);

  /* Group by category */
  const grouped = React.useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    for (const item of filtered) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return map;
  }, [filtered]);

  /* Flat list for keyboard indexing */
  const flatFiltered = React.useMemo(() => {
    const flat: CommandItem[] = [];
    for (const items of grouped.values()) {
      flat.push(...items);
    }
    return flat;
  }, [grouped]);

  /* Keyboard shortcut to open */
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  /* Scroll selected item into view */
  React.useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector("[data-selected='true']");
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  /* Navigate to item */
  function go(item: CommandItem) {
    setOpen(false);
    setQuery("");
    router.push(item.href);
  }

  /* Keyboard navigation inside the list */
  function onInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % (flatFiltered.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 + (flatFiltered.length || 1)) % (flatFiltered.length || 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = flatFiltered[selectedIndex];
      if (item) go(item);
    }
  }

  /* Reset state when dialog closes */
  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setQuery("");
      setSelectedIndex(0);
    }
  }

  /* Track flat index across groups */
  let flatIndex = -1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg gap-0 overflow-hidden p-0 sm:rounded-xl"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <DialogTitle className="sr-only">Vyhledávání příkazů</DialogTitle>

        {/* Search input */}
        <div className="flex items-center gap-2 border-b border-border px-4">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={onInputKeyDown}
            placeholder="Hledat stránku nebo aplikaci..."
            className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="hidden text-[10px] font-medium text-muted-foreground sm:inline-block">ESC</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[min(60vh,24rem)] overflow-y-auto px-2 py-2">
          {flatFiltered.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              Nic nenalezeno.
            </p>
          )}

          {Array.from(grouped.entries()).map(([category, items]) => (
            <div key={category} className="mb-1">
              <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {category}
              </p>
              {items.map((item) => {
                flatIndex++;
                const isSelected = flatIndex === selectedIndex;
                const Icon = item.icon;
                const idx = flatIndex; // capture for closure
                return (
                  <button
                    key={item.id}
                    data-selected={isSelected}
                    onClick={() => go(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      isSelected
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground hover:bg-accent/50"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate text-left">{item.label}</span>
                    {item.adminOnly && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        admin
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer hints */}
        <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span><kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">&uarr;&darr;</kbd> navigace</span>
            <span><kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">&crarr;</kbd> otevřít</span>
            <span><kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">esc</kbd> zavřít</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
