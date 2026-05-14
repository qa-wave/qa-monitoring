import Link from "next/link";
import { Activity, AlertTriangle, Bug, GitPullRequest, Rocket, TestTube2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { StatusMatrix } from "@/components/dashboard/StatusMatrix";
import { IncidentBanner } from "@/components/dashboard/IncidentBanner";
import { ReleaseListItem } from "@/components/dashboard/ReleaseListItem";
import { TestRunRow } from "@/components/dashboard/TestRunRow";
import { FlagListItem } from "@/components/dashboard/FlagListItem";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { DoraCard } from "@/components/dashboard/DoraCard";
import { DeployHeatmap } from "@/components/dashboard/DeployHeatmap";
import { ServiceMap } from "@/components/dashboard/ServiceMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusDot } from "@/components/ui/status-dot";
import { formatNumber, formatPercent, formatRelativeTime } from "@/lib/utils";
import { overviewData } from "@/lib/dashboard-data";
import { computeDoraMetrics } from "@/data/dora-metrics";
import { parsePersona, personaDescription, personaLabel, personaWidgets } from "@/lib/personas";
import { getSessionUser } from "@/lib/auth";
import { listApplications } from "@/lib/applications/store";
import { deployments } from "@/data/deployments";
import { getT } from "@/lib/i18n/server";
import { DashboardFilterBar } from "@/components/dashboard/DashboardFilterBar";
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist";
import { listIntegrations } from "@/lib/integrations/store";
import { listPublicUsers } from "@/lib/users/store";
import { listEnvironments } from "@/lib/environments/store";
import { getBrandSettings, DEFAULT_BRAND } from "@/lib/branding";
import { DashboardLayout } from "./DashboardLayout";

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ persona?: string; env?: string }>;
}) {
  const sp = await searchParams;
  const user = await getSessionUser();
  const persona = parsePersona(sp.persona ?? user?.personaPreference ?? "dev");
  const widgets = new Set(personaWidgets[persona]);
  const data = await overviewData(sp.env);
  const applications = await listApplications();
  const appMap = new Map(applications.map((a) => [a.id, a]));
  const { t, locale } = await getT();

  // Collect visible widget sections for DashboardGrid reordering
  const sections: React.ReactNode[] = [];

  if (data.activePrimaryIncident) {
    sections.push(<IncidentBanner key="incident-banner" incident={data.activePrimaryIncident} />);
  }

  if (user?.role === "admin") {
    const [integrations, allUsers, allEnvs, brand] = await Promise.all([
      listIntegrations(),
      listPublicUsers(),
      listEnvironments(),
      getBrandSettings(),
    ]);
    const brandCustomized =
      brand.primary !== DEFAULT_BRAND.primary ||
      brand.productName !== DEFAULT_BRAND.productName ||
      brand.style !== DEFAULT_BRAND.style;
    sections.push(
      <OnboardingChecklist
        key="onboarding"
        brandCustomized={brandCustomized}
        integrationCount={integrations.length}
        userCount={allUsers.length}
        envCount={allEnvs.length}
      />
    );
  }

  if (widgets.has("kpis")) {
    sections.push(
      <section key="kpis" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t.dashboard.uptime}
          value={formatPercent(data.uptime, 2)}
          status={data.uptime > 99.9 ? "ok" : data.uptime > 99 ? "warn" : "down"}
          delta={{ value: "+0,02 %", direction: "up", positive: true }}
          hint={t.kpi.vsLastWeek}
          icon={Activity}
          href="/environments"
        />
        <KpiCard
          label={t.dashboard.latency}
          value={formatNumber(data.p95)}
          unit="ms"
          status={data.p95 < 400 ? "ok" : data.p95 < 600 ? "warn" : "down"}
          delta={{ value: "-12 ms", direction: "down", positive: true }}
          hint={t.kpi.vs24h}
          icon={Activity}
          href="/environments"
        />
        <KpiCard
          label={t.dashboard.errors24h}
          value={formatPercent(data.errorRate, 2)}
          status={data.errorRate < 0.5 ? "ok" : data.errorRate < 1 ? "warn" : "down"}
          delta={{ value: `+${data.errorCount}`, direction: "up", positive: false }}
          hint={t.kpi.uniqueEvents}
          icon={Bug}
          href="/quality"
        />
        <KpiCard
          label={t.dashboard.deploysToday}
          value={String(data.deploysToday)}
          status="info"
          delta={{ value: "+6", direction: "up", positive: true }}
          hint={t.kpi.acrossEnvs}
          icon={Rocket}
          href="/releases"
        />
      </section>
    );
  }

  if (widgets.has("matrix")) {
    sections.push(
      <StatusMatrix
        key="matrix"
        applications={data.applications}
        environments={data.allEnvironments}
        healthChecks={data.healthChecks}
      />
    );
  }

  if (widgets.has("dora")) {
    sections.push(<DoraCard key="dora" data={computeDoraMetrics()} />);
  }

  if (widgets.has("deploys") || widgets.has("dora")) {
    sections.push(<DeployHeatmap key="heatmap" deployments={deployments} locale={locale} />);
  }

  if (widgets.has("matrix")) {
    sections.push(<ServiceMap key="service-map" />);
  }

  if (widgets.has("releases") || widgets.has("incidents")) {
    sections.push(
      <section key="releases-incidents" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {widgets.has("releases") ? (
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>
                {t.dashboard.recentReleases}
              </CardTitle>
              <div className="flex items-center gap-3">
                <Link href="/releases" className="text-xs font-medium text-muted-foreground hover:text-foreground">
                  {t.common.viewAll}
                </Link>
                <Badge variant="outline" className="gap-1">
                  <Rocket className="h-3 w-3" />
                  {data.recentReleases.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="divide-y divide-border/60 pt-0">
              {data.recentReleases.map((release) => (
                <ReleaseListItem key={release.id} release={release} />
              ))}
            </CardContent>
          </Card>
        ) : null}

        {widgets.has("incidents") ? (
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>{t.dashboard.openIncidents}</CardTitle>
              <Badge variant={data.incidents.length > 0 ? "danger" : "outline"}>
                {data.incidents.length}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {data.incidents.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t.dashboard.noIncidents}</p>
              ) : (
                data.incidents.map((inc) => (
                  <a
                    key={inc.id}
                    href={`/incidents/${inc.id}`}
                    className="flex items-start gap-3 rounded-md border border-transparent px-2 py-2 text-sm hover:border-border hover:bg-accent/40"
                  >
                    <StatusDot status={inc.severity === "sev1" ? "down" : "warn"} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={inc.severity === "sev1" ? "danger" : "warning"}>
                          {inc.severity.toUpperCase()}
                        </Badge>
                        <span className="font-medium">{inc.title}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {inc.status === "investigating"
                          ? "Vyšetřuje se"
                          : inc.status === "monitoring"
                          ? "Monitoruje se"
                          : "Otevřený"}{" "}
                        · začal {formatRelativeTime(inc.startedAt)}
                      </div>
                    </div>
                  </a>
                ))
              )}
            </CardContent>
          </Card>
        ) : null}
      </section>
    );
  }

  if (widgets.has("tests") || widgets.has("flags") || widgets.has("errors")) {
    sections.push(
      <section key="tests-flags-errors" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {widgets.has("tests") ? (
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>{t.dashboard.testsInProd}</CardTitle>
                <p className="text-xs text-muted-foreground">{t.kpi.passRate7d}</p>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/tests" className="text-xs font-medium text-muted-foreground hover:text-foreground">
                  {t.common.viewAll}
                </Link>
                <Sparkline
                  points={[91, 92, 94, 93, 95, 96, 97, 97, 98, 97]}
                  width={110}
                  height={30}
                  color="hsl(var(--status-ok))"
                  ariaLabel="Pass rate trend"
                />
                <Badge variant="success">
                  <TestTube2 className="mr-1 h-3 w-3" />
                  {data.passRate.toFixed(1).replace(".", ",")} %
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="divide-y divide-border/60 pt-0">
              {data.recentTestRuns.slice(0, 5).map((run) => (
                <TestRunRow key={run.id} run={run} appName={appMap.get(run.appId)?.name} />
              ))}
            </CardContent>
          </Card>
        ) : null}

        {widgets.has("flags") ? (
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>{t.dashboard.featureFlags}</CardTitle>
              <Badge variant="outline" className="gap-1">
                <GitPullRequest className="h-3 w-3" />
                {data.flags.length}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {data.flags.map((flag) => (
                <FlagListItem key={flag.id} flag={flag} environments={data.allEnvironments} />
              ))}
            </CardContent>
          </Card>
        ) : null}

        {widgets.has("errors") ? (
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>{t.dashboard.topErrors}</CardTitle>
              <Badge variant={data.errorSummaries.length > 0 ? "warning" : "outline"}>
                <AlertTriangle className="mr-1 h-3 w-3" />
                {data.errorSummaries.length}
              </Badge>
            </CardHeader>
            <CardContent className="pt-0">
              {data.errorSummaries.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t.dashboard.noErrors}</p>
              ) : (
                <ul className="divide-y divide-border/60">
                  {data.errorSummaries.map((err) => (
                    <li key={err.id} className="flex items-center gap-3 py-2 text-sm">
                      <StatusDot status={err.level === "fatal" ? "down" : err.level === "error" ? "warn" : "info"} />
                      <span className="flex-1 truncate font-mono text-xs">{err.title}</span>
                      <Badge variant="outline">{appMap.get(err.appId)?.name}</Badge>
                      <span className="font-mono text-xs tabular-nums text-muted-foreground">
                        {formatNumber(err.count24h)}×
                      </span>
                      <span className="text-xs text-muted-foreground">{err.usersAffected} {t.kpi.users}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ) : null}
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.dashboard.title}
        description={`Pohled ${personaLabel[persona].toLowerCase()} · ${personaDescription[persona]} · Data k ${new Date().toLocaleDateString(locale === "en" ? "en-GB" : "cs-CZ")}`}
      />

      <DashboardFilterBar environments={data.allEnvironments.map(e => e.name)} />
      <DashboardLayout>{sections}</DashboardLayout>
    </div>
  );
}
