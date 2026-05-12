import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusDot } from "@/components/ui/status-dot";
import { IncidentTimeline } from "@/components/dashboard/IncidentTimeline";
import { formatDateTime } from "@/lib/utils";
import { incidents } from "@/data/incidents";
import { applications } from "@/data/applications";
import { environments } from "@/data/environments";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const incident = incidents.find((i) => i.id === id);
  return { title: incident?.title ?? "Incident" };
}

export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const incident = incidents.find((i) => i.id === id);
  if (!incident) notFound();

  const appMap = new Map(applications.map((a) => [a.id, a]));
  const envMap = new Map(environments.map((e) => [e.id, e]));

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Incidenty", href: "/incidents" }, { label: incident.title }]} />
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <Badge variant={incident.severity === "sev1" ? "danger" : "warning"}>
              {incident.severity.toUpperCase()}
            </Badge>
            {incident.title}
          </span>
        }
        description={incident.description}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Stav</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <StatusDot status={incident.status === "resolved" ? "ok" : "down"} />
              <span className="font-medium">
                {incident.status === "resolved"
                  ? "Vyřešeno"
                  : incident.status === "monitoring"
                  ? "Monitoruje se"
                  : incident.status === "investigating"
                  ? "Vyšetřuje se"
                  : "Otevřený"}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Čas</CardTitle></CardHeader>
          <CardContent className="space-y-1 pt-0 text-sm text-muted-foreground">
            <div>Začátek: {formatDateTime(incident.startedAt)}</div>
            <div>{incident.resolvedAt ? `Konec: ${formatDateTime(incident.resolvedAt)}` : "Probíhá"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Dotčené</CardTitle></CardHeader>
          <CardContent className="space-y-2 pt-0">
            <div className="flex flex-wrap gap-1">
              {incident.affectedAppIds.map((id) => (
                <Badge key={id} variant="outline">{appMap.get(id)?.name ?? id}</Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {incident.affectedEnvIds.map((id) => (
                <Badge key={id} variant="info">{envMap.get(id)?.name ?? id}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
        <CardContent className="pt-0">
          <IncidentTimeline
            updates={incident.updates}
            startedAt={incident.startedAt}
            resolvedAt={incident.resolvedAt}
          />
        </CardContent>
      </Card>

      {incident.postmortemUrl ? (
        <p className="text-sm">
          <Link href={incident.postmortemUrl} target="_blank" rel="noreferrer" className="underline hover:text-foreground">
            Postmortem dokument →
          </Link>
        </p>
      ) : null}
    </div>
  );
}
