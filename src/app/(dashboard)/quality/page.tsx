import { PageHeader } from "@/components/dashboard/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Bug, FlaskConical, CheckCircle, TestTube2 } from "lucide-react";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { securityVulnerabilities } from "@/data/security-vulnerabilities";
import { testRuns } from "@/data/test-runs";
import { applications } from "@/data/applications";
import { formatRelativeTime } from "@/lib/utils";
import { ExportVulnerabilities } from "./ExportButton";
import { getT } from "@/lib/i18n/server";

const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const severityVariant: Record<string, "danger" | "warning" | "info" | "outline"> = {
  critical: "danger",
  high: "warning",
  medium: "info",
  low: "outline",
};

export default async function QualityPage() {
  const { t } = await getT();
  const appMap = new Map(applications.map((a) => [a.id, a.name]));
  const sorted = [...securityVulnerabilities].sort(
    (a, b) => (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9)
  );

  const fixableCount = securityVulnerabilities.filter((v) => v.fixAvailable).length;

  // Coverage: pick latest run per app that has coveragePct
  const coverageByApp = new Map<string, number>();
  for (const run of testRuns) {
    if (run.coveragePct != null && !coverageByApp.has(run.appId)) {
      coverageByApp.set(run.appId, run.coveragePct);
    }
  }
  const coverageEntries = [...coverageByApp.entries()]
    .map(([appId, pct]) => ({ appId, name: appMap.get(appId) ?? appId, pct }))
    .sort((a, b) => b.pct - a.pct);
  const avgCoverage =
    coverageEntries.length > 0
      ? coverageEntries.reduce((s, e) => s + e.pct, 0) / coverageEntries.length
      : 0;

  // Pass rate
  const totalPassed = testRuns.reduce((s, r) => s + r.passed, 0);
  const totalFailed = testRuns.reduce((s, r) => s + r.failed, 0);
  const passRate = totalPassed + totalFailed > 0 ? (totalPassed / (totalPassed + totalFailed)) * 100 : 100;

  // Flaky tests
  const flakyRuns = testRuns.filter((r) => r.flaky > 0);
  const totalFlaky = flakyRuns.reduce((s, r) => s + r.flaky, 0);
  const previousPeriodFlaky = 21; // hardcoded "previous period" baseline
  const flakyDelta = totalFlaky - previousPeriodFlaky;
  const flakyTrend = flakyDelta > 0 ? "up" : flakyDelta < 0 ? "down" : "flat";

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.pages.quality.title}
        description={t.pages.quality.description}
        actions={<ExportVulnerabilities data={securityVulnerabilities} />}
      />

      {/* KPI cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Zranitelnosti"
          value={String(securityVulnerabilities.length)}
          status={securityVulnerabilities.length > 5 ? "down" : securityVulnerabilities.length > 2 ? "warn" : "ok"}
          icon={ShieldCheck}
          hint="celkový počet"
        />
        <KpiCard
          label="Opravitelné"
          value={String(fixableCount)}
          status="info"
          icon={Bug}
          hint="fix je k dispozici"
        />
        <KpiCard
          label="Pokrytí kódu"
          value={`${avgCoverage.toFixed(1).replace(".", ",")} %`}
          status={avgCoverage >= 80 ? "ok" : avgCoverage >= 60 ? "warn" : "down"}
          icon={FlaskConical}
          hint="průměr napříč aplikacemi"
        />
        <KpiCard
          label="Pass rate"
          value={`${passRate.toFixed(1).replace(".", ",")} %`}
          status={passRate >= 98 ? "ok" : passRate >= 95 ? "warn" : "down"}
          icon={CheckCircle}
          hint="všechny test suites"
        />
      </section>

      {/* Security vulnerabilities table */}
      <Card>
        <CardHeader>
          <CardTitle>Bezpečnostní zranitelnosti</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                <th className="pb-2 pr-3">Závažnost</th>
                <th className="pb-2 pr-3">CVE</th>
                <th className="pb-2 pr-3">Balíček</th>
                <th className="pb-2 pr-3">Aplikace</th>
                <th className="pb-2 pr-3">Popis</th>
                <th className="pb-2 pr-3">Fix</th>
                <th className="pb-2 text-right">Objeveno</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {sorted.map((v) => (
                <tr key={v.id} className="hover:bg-accent/40">
                  <td className="py-2 pr-3">
                    <Badge variant={severityVariant[v.severity]}>{v.severity}</Badge>
                  </td>
                  <td className="py-2 pr-3 font-mono text-xs">{v.cve}</td>
                  <td className="py-2 pr-3 font-mono text-xs">
                    {v.package}@{v.currentVersion}
                  </td>
                  <td className="py-2 pr-3">{appMap.get(v.appId) ?? v.appId}</td>
                  <td className="py-2 pr-3 max-w-[260px] truncate" title={v.title}>
                    {v.title}
                  </td>
                  <td className="py-2 pr-3">
                    {v.fixAvailable ? (
                      <Badge variant="success">ano</Badge>
                    ) : (
                      <Badge variant="outline">ne</Badge>
                    )}
                  </td>
                  <td className="py-2 text-right text-xs text-muted-foreground whitespace-nowrap">
                    {formatRelativeTime(v.discoveredAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Code coverage per app */}
      <Card>
        <CardHeader>
          <CardTitle>Pokrytí kódu podle aplikace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {coverageEntries.map((entry) => (
            <div key={entry.appId} className="flex items-center gap-3">
              <span className="w-28 text-sm font-medium truncate">{entry.name}</span>
              <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    entry.pct >= 80
                      ? "bg-[hsl(var(--status-ok))]"
                      : entry.pct >= 60
                      ? "bg-[hsl(var(--status-warn))]"
                      : "bg-[hsl(var(--status-down))]"
                  }`}
                  style={{ width: `${entry.pct}%` }}
                />
              </div>
              <span className="w-14 text-right text-sm font-mono tabular-nums">
                {entry.pct} %
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Flaky tests */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Flaky testy ({totalFlaky})</CardTitle>
            <span
              className={`text-xs font-medium ${
                flakyTrend === "up"
                  ? "text-[hsl(var(--status-down))]"
                  : flakyTrend === "down"
                  ? "text-[hsl(var(--status-ok))]"
                  : "text-muted-foreground"
              }`}
            >
              {flakyTrend === "up" ? "↑" : flakyTrend === "down" ? "↓" : "→"}{" "}
              {flakyDelta > 0 ? "+" : ""}
              {flakyDelta} vs minulý týden
            </span>
          </div>
          <Badge variant="warning">{flakyRuns.length} runů</Badge>
        </CardHeader>
        <CardContent className="pt-0 overflow-x-auto">
          {flakyRuns.length === 0 ? (
            <EmptyState title="Žádné flaky testy" description="Všechny testy běží stabilně." icon={TestTube2} />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                  <th className="pb-2 pr-3">Aplikace</th>
                  <th className="pb-2 pr-3">Suite</th>
                  <th className="pb-2 pr-3">Prostředí</th>
                  <th className="pb-2 pr-3 text-right">Flaky</th>
                  <th className="pb-2 pr-3 text-right">Prošlo</th>
                  <th className="pb-2 text-right">Selhalo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {flakyRuns.map((r) => (
                  <tr key={r.id} className="hover:bg-accent/40">
                    <td className="py-2 pr-3">{appMap.get(r.appId) ?? r.appId}</td>
                    <td className="py-2 pr-3">{r.suite}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{r.envId}</td>
                    <td className="py-2 pr-3 text-right font-mono tabular-nums text-[hsl(var(--status-warn))]">
                      {r.flaky}
                    </td>
                    <td className="py-2 pr-3 text-right font-mono tabular-nums">{r.passed}</td>
                    <td className="py-2 text-right font-mono tabular-nums">{r.failed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
