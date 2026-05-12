"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusDot } from "@/components/ui/status-dot";
import { Badge } from "@/components/ui/badge";
import type { TestRun, TestSuite, Application, Environment } from "@/lib/types";

const suites: TestSuite[] = ["unit", "integration", "e2e", "smoke", "load"];
const suiteLabel: Record<TestSuite, string> = {
  unit: "Unit",
  integration: "Integrace",
  e2e: "E2E",
  smoke: "Smoke",
  load: "Zátěž",
};

interface TestsClientProps {
  applications: Application[];
  environments: Environment[];
  testRuns: TestRun[];
}

export function TestsClient({ applications, environments, testRuns }: TestsClientProps) {
  const [appFilter, setAppFilter] = useState<string>("all");
  const [suiteFilter, setSuiteFilter] = useState<string>("all");
  const [onlyFailing, setOnlyFailing] = useState(false);

  const envs = useMemo(() => [...environments].sort((a, b) => a.order - b.order), [environments]);

  const testsByKey = useMemo(() => {
    const map = new Map<string, TestRun>();
    for (const run of testRuns) {
      map.set(`${run.appId}:${run.envId}:${run.suite}`, run);
    }
    return map;
  }, [testRuns]);

  const filteredSuites = suiteFilter === "all" ? suites : suites.filter((s) => s === suiteFilter);

  const filteredApps = useMemo(() => {
    let apps = applications;
    if (appFilter !== "all") {
      apps = apps.filter((a) => a.id === appFilter);
    }
    return apps;
  }, [applications, appFilter]);

  const hasFailingRun = (appId: string, envId: string) => {
    return filteredSuites.some((s) => {
      const run = testsByKey.get(`${appId}:${envId}:${s}`);
      return run && run.failed > 0;
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="app-filter" className="text-sm font-medium text-muted-foreground">
            Aplikace
          </label>
          <select
            id="app-filter"
            value={appFilter}
            onChange={(e) => setAppFilter(e.target.value)}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-sm"
          >
            <option value="all">Vše</option>
            {applications.map((app) => (
              <option key={app.id} value={app.id}>
                {app.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="suite-filter" className="text-sm font-medium text-muted-foreground">
            Suite
          </label>
          <select
            id="suite-filter"
            value={suiteFilter}
            onChange={(e) => setSuiteFilter(e.target.value)}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-sm"
          >
            <option value="all">Vše</option>
            {suites.map((s) => (
              <option key={s} value={s}>
                {suiteLabel[s]}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={onlyFailing}
            onChange={(e) => setOnlyFailing(e.target.checked)}
            className="rounded border-border"
          />
          <span className="text-muted-foreground">Jen selhávající</span>
        </label>
      </div>

      {/* Test matrix */}
      {envs.map((env) => {
        const appsInEnv = filteredApps.filter((a) => a.environmentIds.includes(env.id));
        const visibleApps = onlyFailing
          ? appsInEnv.filter((app) => hasFailingRun(app.id, env.id))
          : appsInEnv;

        if (visibleApps.length === 0) return null;

        return (
          <Card key={env.id}>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>
                Prostředí: <span className="font-mono">{env.name}</span>
              </CardTitle>
              {env.isProduction ? <Badge variant="info">prod</Badge> : null}
            </CardHeader>
            <CardContent className="overflow-x-auto pt-0">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="w-36 pb-2 font-medium">Aplikace</th>
                    {filteredSuites.map((s) => (
                      <th key={s} className="px-2 pb-2 font-medium">
                        {suiteLabel[s]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleApps.map((app) => (
                    <tr key={app.id} className="border-t border-border/60">
                      <td className="py-3 pr-4 font-medium">{app.name}</td>
                      {filteredSuites.map((s) => {
                        const run = testsByKey.get(`${app.id}:${env.id}:${s}`);
                        return (
                          <td key={s} className="px-2 py-3">
                            {run ? (
                              <div className="flex items-center gap-2 text-xs">
                                <StatusDot status={run.status} />
                                <span className="font-mono tabular-nums">
                                  {run.passed}/{run.passed + run.failed}
                                </span>
                                {run.flaky > 0 ? (
                                  <Badge variant="warning" className="gap-1">
                                    {run.flaky} flaky
                                  </Badge>
                                ) : null}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground/60">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
