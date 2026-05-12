"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatDuration, formatRelativeTime } from "@/lib/utils";
import { Search } from "lucide-react";
import type { Incident } from "@/lib/types";

type Tab = "all" | "active" | "resolved";
type SeverityFilter = "all" | "sev1" | "sev2" | "sev3";
type SortMode = "newest" | "oldest" | "severity";

const severityOrder: Record<string, number> = { sev1: 0, sev2: 1, sev3: 2 };

export function IncidentsClient({ incidents }: { incidents: Incident[] }) {
  const [tab, setTab] = useState<Tab>("all");
  const [severity, setSeverity] = useState<SeverityFilter>("all");
  const [sort, setSort] = useState<SortMode>("newest");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = [...incidents];

    // Tab filter
    if (tab === "active") list = list.filter((i) => i.status !== "resolved");
    if (tab === "resolved") list = list.filter((i) => i.status === "resolved");

    // Severity filter
    if (severity !== "all") list = list.filter((i) => i.severity === severity);

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sort === "newest") {
      list.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
    } else if (sort === "oldest") {
      list.sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());
    } else {
      list.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    }

    return list;
  }, [incidents, tab, severity, sort, search]);

  const activeCount = incidents.filter((i) => i.status !== "resolved").length;
  const resolvedCount = incidents.filter((i) => i.status === "resolved").length;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Tabs */}
        <div className="flex rounded-md border border-border">
          {([
            ["all", `Vse (${incidents.length})`],
            ["active", `Aktivni (${activeCount})`],
            ["resolved", `Vyresene (${resolvedCount})`],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={
                "px-3 py-1.5 text-xs font-medium transition-colors first:rounded-l-md last:rounded-r-md " +
                (tab === value
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              {label}
            </button>
          ))}
        </div>

        {/* Severity filter */}
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value as SeverityFilter)}
          className="rounded-md border border-border bg-background px-2 py-1.5 text-xs"
        >
          <option value="all">Vsechny severity</option>
          <option value="sev1">SEV1</option>
          <option value="sev2">SEV2</option>
          <option value="sev3">SEV3</option>
        </select>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortMode)}
          className="rounded-md border border-border bg-background px-2 py-1.5 text-xs"
        >
          <option value="newest">Nejnovejsi</option>
          <option value="oldest">Nejstarsi</option>
          <option value="severity">Dle severity</option>
        </select>

        {/* Search */}
        <div className="relative ml-auto">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Hledat incidenty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-md border border-border bg-background py-1.5 pl-7 pr-3 text-xs placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Zadne incidenty odpovidajici filtru.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="divide-y divide-border/60 pt-6">
            {filtered.map((inc) => {
              const isResolved = inc.status === "resolved";
              const duration = inc.resolvedAt
                ? Math.round(
                    (new Date(inc.resolvedAt).getTime() - new Date(inc.startedAt).getTime()) / 1000
                  )
                : 0;
              return (
                <Link
                  key={inc.id}
                  href={`/incidents/${inc.id}`}
                  className="flex items-start gap-3 rounded-md border border-transparent px-2 py-3 transition-colors hover:border-border hover:bg-accent/40"
                >
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          inc.severity === "sev1"
                            ? "danger"
                            : inc.severity === "sev2"
                            ? "warning"
                            : "outline"
                        }
                      >
                        {inc.severity.toUpperCase()}
                      </Badge>
                      <span className="font-medium">{inc.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{inc.description}</p>
                  </div>
                  <div className="shrink-0 text-right text-xs text-muted-foreground">
                    {isResolved ? (
                      <>
                        <div>{formatDateTime(inc.startedAt)}</div>
                        <div>trvani {formatDuration(duration)}</div>
                      </>
                    ) : (
                      <div>trva od {formatRelativeTime(inc.startedAt)}</div>
                    )}
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
