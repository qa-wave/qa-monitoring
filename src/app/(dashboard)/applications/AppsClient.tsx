"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusDot } from "@/components/ui/status-dot";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import type { Application, Environment, HealthCheck } from "@/lib/types";

interface AppsClientProps {
  applications: Application[];
  environments: Environment[];
  healthChecks: HealthCheck[];
}

export function AppsClient({ applications, environments, healthChecks }: AppsClientProps) {
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState<string>("all");

  const languages = useMemo(() => {
    const set = new Set(applications.map((a) => a.language));
    return [...set].sort();
  }, [applications]);

  const filtered = useMemo(() => {
    let apps = applications;
    if (search) {
      const q = search.toLowerCase();
      apps = apps.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.slug.toLowerCase().includes(q),
      );
    }
    if (langFilter !== "all") {
      apps = apps.filter((a) => a.language === langFilter);
    }
    return apps;
  }, [applications, search, langFilter]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Hledat aplikaci..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-md border border-border bg-card py-1.5 pl-9 pr-3 text-sm placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="lang-filter" className="text-sm font-medium text-muted-foreground">
            Jazyk
          </label>
          <select
            id="lang-filter"
            value={langFilter}
            onChange={(e) => setLangFilter(e.target.value)}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-sm"
          >
            <option value="all">Vše</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((app) => {
          const appHealth = healthChecks.filter((h) => h.appId === app.id);
          const hasDown = appHealth.some((h) => h.status === "down");
          const hasWarn = appHealth.some((h) => h.status === "warn");
          const overall = hasDown ? "down" : hasWarn ? "warn" : "ok";
          return (
            <Link key={app.id} href={`/applications/${app.slug}`}>
              <Card className="transition-colors hover:border-accent">
                <CardHeader className="flex-row items-start justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {app.name}
                      <Badge variant="outline">{app.language}</Badge>
                    </CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {app.description}
                    </p>
                  </div>
                  <StatusDot status={overall} size="lg" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap items-center gap-1 text-xs">
                    {environments
                      .filter((e) => app.environmentIds.includes(e.id))
                      .sort((a, b) => a.order - b.order)
                      .map((e) => {
                        const hc = appHealth.find((h) => h.envId === e.id);
                        return (
                          <Badge
                            key={e.id}
                            variant={
                              hc?.status === "down"
                                ? "danger"
                                : hc?.status === "warn"
                                  ? "warning"
                                  : hc?.status === "ok"
                                    ? "success"
                                    : "outline"
                            }
                          >
                            {e.name}
                          </Badge>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Žádná aplikace neodpovídá filtru.
        </p>
      )}
    </div>
  );
}
