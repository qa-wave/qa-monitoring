import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Activity, CheckCircle2 } from "lucide-react";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { PipelineDiagram } from "@/components/dashboard/PipelineDiagram";
import { TestRunRow } from "@/components/dashboard/TestRunRow";
import { FlagListItem } from "@/components/dashboard/FlagListItem";
import { AuditLog } from "@/components/dashboard/AuditLog";
import { AreaChart } from "@/components/dashboard/AreaChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/ui/status-dot";
import { formatRelativeTime } from "@/lib/utils";
import { environmentDetailData, pipelineLatestByEnv } from "@/lib/dashboard-data";
import { listEnvironments } from "@/lib/environments/store";
import { listApplications } from "@/lib/applications/store";

export async function generateMetadata({ params }: { params: Promise<{ env: string }> }) {
  const { env: slug } = await params;
  const environments = await listEnvironments();
  const env = environments.find((e) => e.slug === slug);
  return { title: env?.name ?? "Prostředí" };
}

export default async function EnvironmentDetailPage({
  params,
}: {
  params: Promise<{ env: string }>;
}) {
  const { env: slug } = await params;
  const data = await environmentDetailData(slug);
  if (!data) notFound();
  const { environment: env } = data;
  const applications = await listApplications();
  const appMap = new Map(applications.map((a) => [a.id, a]));
  const environments = await listEnvironments();
  const pipeline = await pipelineLatestByEnv();

  const hasDown = data.healthChecks.some((h) => h.status === "down");
  const hasWarn = data.healthChecks.some((h) => h.status === "warn");
  const overall = hasDown ? "down" : hasWarn ? "warn" : "ok";
  const avgUptime =
    data.healthChecks.reduce((a, h) => a + h.uptimePct30d, 0) / Math.max(1, data.healthChecks.length);
  const activeIncCount = data.incidents.filter((i) => i.status !== "resolved").length;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Prostředí", href: "/environments" }, { label: env.name }]} />
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            {env.name}
            {env.isProduction ? <Badge variant="info">prod</Badge> : null}
            <StatusDot status={overall} size="lg" />
          </span>
        }
        description={
          <span className="flex flex-wrap items-center gap-4 text-sm">
            <span>Uptime 30d: {avgUptime.toFixed(2).replace(".", ",")} %</span>
            <span>Aktivní incidenty: {activeIncCount}</span>
            <a
              href={env.url}
              className="inline-flex items-center gap-1 text-xs hover:text-foreground"
              target="_blank"
              rel="noreferrer"
            >
              {env.url}
              <ExternalLink className="h-3 w-3" />
            </a>
          </span>
        }
        actions={
          <>
            <Button variant="outline" size="sm" disabled title="Plánováno v budoucí verzi">
              Povýšit z předchozího
            </Button>
            <Button variant="outline" size="sm" disabled title="Plánováno v budoucí verzi">
              Freeze
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Deploy pipeline</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <PipelineDiagram environments={environments} latestByEnv={pipeline} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Aplikace ({data.applications.length})</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border/60 pt-0 text-sm">
            {data.applications.map((app) => {
              const hc = data.healthChecks.find((h) => h.appId === app.id);
              const latestDeploy = data.deployments
                .filter((d) => d.appId === app.id)
                .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[0];
              return (
                <Link
                  key={app.id}
                  href={`/applications/${app.slug}?env=${env.slug}`}
                  className="flex items-center gap-3 py-2"
                >
                  <StatusDot status={hc?.status ?? "muted"} />
                  <span className="w-24 font-medium">{app.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {latestDeploy?.version ?? "—"}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {hc?.latencyMs} ms · {hc?.uptimePct30d.toFixed(2).replace(".", ",")} %
                  </span>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Infrastruktura</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 pt-0 text-sm">
            <InfraStat label="k8s pods" value="12 / 12" hint="CPU 44 % · mem 68 %" />
            <InfraStat label="DB connections" value="18 / 100" hint="p95 14 ms" />
            <InfraStat label="Fronta" value="23 msg" hint="lag pod limitem" />
            <InfraStat label="CDN hit rate" value="98,2 %" hint="posledních 24 h" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>APM & chyby (24 h)</CardTitle>
            <p className="text-xs text-muted-foreground">p95 latence</p>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <AreaChart
              data={Array.from({ length: 24 }, (_, i) => ({
                label: `${i.toString().padStart(2, "0")}:00`,
                value: Math.round(270 + Math.sin(i / 3) * 25 + (i % 5) * 3),
              }))}
              height={140}
              color="hsl(var(--status-info))"
              unit="ms"
              ariaLabel="p95 latence za posledních 24 hodin"
            />
            {data.errors.length === 0 ? (
              <EmptyState title="Žádné chyby" description="V tomto prostředí nebyly nalezeny žádné chyby." icon={CheckCircle2} />
            ) : (
              <ul className="divide-y divide-border/60">
                {data.errors.slice(0, 3).map((err) => (
                  <li key={err.id} className="flex items-center gap-3 py-2 text-sm">
                    <StatusDot status={err.level === "fatal" ? "down" : "warn"} />
                    <span className="flex-1 truncate font-mono text-xs">{err.title}</span>
                    <Badge variant="outline">{appMap.get(err.appId)?.name}</Badge>
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {err.count24h}×
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Testy v {env.name}</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border/60 pt-0">
            {data.testRuns.slice(0, 5).map((run) => (
              <TestRunRow key={run.id} run={run} appName={appMap.get(run.appId)?.name} />
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feature flags v {env.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          {data.flags.map((flag) => (
            <FlagListItem key={flag.id} flag={flag} environments={[env]} />
          ))}
        </CardContent>
      </Card>

      <AuditLog entries={data.auditLog} />

      {data.incidents.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Incidenty v {env.name}</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border/60 pt-0">
            {data.incidents.map((inc) => (
              <Link
                key={inc.id}
                href={`/incidents/${inc.id}`}
                className="flex items-center gap-3 py-2 text-sm"
              >
                <Badge variant={inc.severity === "sev1" ? "danger" : "warning"}>
                  {inc.severity.toUpperCase()}
                </Badge>
                <span className="flex-1">{inc.title}</span>
                <span className="text-xs text-muted-foreground">
                  {inc.status === "resolved" ? "vyřešeno" : "aktivní"} · {formatRelativeTime(inc.startedAt)}
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function InfraStat({ label, value, hint, icon: Icon = Activity }: { label: string; value: string; hint: string; icon?: React.ElementType }) {
  return (
    <div className="rounded-md border border-border bg-background/60 p-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="mt-1 font-mono text-lg font-semibold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}
