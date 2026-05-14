"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NotificationDropdownProps {
  incidents: Array<{
    id: string;
    title: string;
    severity: string;
    startedAt: string;
    status: string;
  }>;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "právě teď";
  if (minutes < 60) return `před ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `před ${hours} h`;
  const days = Math.floor(hours / 24);
  return `před ${days} d`;
}

function severityVariant(sev: string): "danger" | "warning" | "info" {
  if (sev === "sev1") return "danger";
  if (sev === "sev2") return "warning";
  return "info";
}

export function NotificationDropdown({ incidents }: NotificationDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const count = incidents.length;
  const visible = incidents.slice(0, 5);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label="Upozornění"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-semibold text-foreground">
              Upozornění
            </span>
            {count > 0 && (
              <Badge variant="secondary" className="text-[11px]">
                {count}
              </Badge>
            )}
          </div>

          {/* List */}
          {visible.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Žádná nová upozornění
            </div>
          ) : (
            <ul className="max-h-[320px] divide-y divide-border overflow-y-auto">
              {visible.map((inc) => (
                <li key={inc.id}>
                  <Link
                    href={`/incidents/${inc.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-accent/50"
                  >
                    <Badge
                      variant={severityVariant(inc.severity)}
                      className="mt-0.5 shrink-0 text-[10px] uppercase"
                    >
                      {inc.severity}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {inc.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {relativeTime(inc.startedAt)}
                        <span className="mx-1.5">·</span>
                        {inc.status}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {/* Footer */}
          <div className="border-t border-border">
            <Link
              href="/incidents"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-accent/50"
            >
              Zobrazit vše &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
