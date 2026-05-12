import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, GitBranch, Users } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusDot } from "@/components/ui/status-dot";
import { TestRunRow } from "@/components/dashboard/TestRunRow";
import { formatRelativeTime } from "@/lib/utils";
import { applicationDetailData } from "@/lib/dashboard-data";
import { applications } from "@/data/applications";

export async function generateMetadata({ params }: { params: Promise<{ app: string }> }) {
  const { app: slug } = await params;
  const app = applications.find((a) => a.slug === slug);
  return { title: app?.name ?? "Aplikace" };
}

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ app: string }>;
}) {
  const { app: slug } = await params;
  const data = applicationDetailData(slug);
  if (!data) notFound();
  const { application: app, perEnv } = data;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Aplikace", href: "/applications" }, { label: app.name }]} />
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            {app.name}
            <Badge variant="outline">{app.language}</Badge>
          </span>
        }
        description={app.description}
        actions={
          <a
            href={app.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs hover:text-foreground"
          >
            <GitBranch className="h-3 w-3" />
            {app.repoUrl.replace("https://github.com/", "")}
            <ExternalLink className="h-3 w-3" />
          </a>
        }
      />

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Users className="h-3 w-3" />
        {app.owners.join(", ")}
        <span>·</span>
        {app.tags.map((tag) => (
          <Badge key={tag} variant="outline">
            {tag}
          </Badge>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stav napříč prostředími</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto pt-0">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="w-24 pb-2 font-medium">Prostředí</th>
                <th className="w-20 pb-2 font-medium">Stav</th>
                <th className="w-40 pb-2 font-medium">Verze</th>
                <th className="w-40 pb-2 font-medium">Nasazeno</th>
                <th className="w-28 pb-2 font-medium">Latence p95</th>
                <th className="w-28 pb-2 font-medium">Uptime 30d</th>
                <th className="w-28 pb-2 font-medium">Testy</th>
              </tr>
            </thead>
            <tbody>
              {perEnv.map(({ env, health, latestDeploy, tests }) => {
                const testPass = tests.reduce((a, t) => a + t.passed, 0);
                const testFail = tests.reduce((a, t) => a + t.failed, 0);
                const testStatus = testFail > 0 ? "warn" : "ok";
                return (
                  <tr key={env.id} className="border-t border-border/60">
                    <td className="py-3 font-medium">
                      <Link href={`/environments/${env.slug}`} className="hover:underline">
                        {env.name}
                      </Link>
                    </td>
                    <td>
                      <StatusDot status={health?.status ?? "muted"} />
                    </td>
                    <td className="font-mono text-xs">{latestDeploy?.version ?? "—"}</td>
                    <td className="text-xs text-muted-foreground">
                      {latestDeploy ? `${formatRelativeTime(latestDeploy.startedAt)} · ${latestDeploy.actor}` : "—"}
                    </td>
                    <td className="font-mono text-xs tabular-nums">{health?.latencyMs ?? "—"} ms</td>
                    <td className="font-mono text-xs tabular-nums">
                      {health?.uptimePct30d.toFixed(2).replace(".", ",")} %
                    </td>
                    <td>
                      <Badge variant={testStatus === "ok" ? "success" : "warning"}>
                        {testPass}/{testPass + testFail}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Chyby</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {data.errors.length === 0 ? (
              <p className="text-sm text-muted-foreground">Žádné chyby.</p>
            ) : (
              <ul className="divide-y divide-border/60">
                {data.errors.map((err) => (
                  <li key={err.id} className="flex items-center gap-3 py-2 text-sm">
                    <StatusDot status={err.level === "fatal" ? "down" : "warn"} />
                    <span className="flex-1 truncate font-mono text-xs">{err.title}</span>
                    <span className="text-xs text-muted-foreground">{err.count24h}×</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nedávné testy</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border/60 pt-0">
            {perEnv
              .flatMap((pe) => pe.tests.slice(0, 2).map((t) => ({ t, envName: pe.env.name })))
              .slice(0, 6)
              .map(({ t }) => (
                <TestRunRow key={t.id} run={t} />
              ))}
          </CardContent>
        </Card>
      </div>

      {data.incidents.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Incidenty týkající se aplikace</CardTitle>
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
