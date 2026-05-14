import { notFound } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
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

  // Compute duration — Date.now() is intentional for ongoing incidents (SSR-only)
  // eslint-disable-next-line react-hooks/purity
  const nowMs = Date.now();
  const durationMs = incident.resolvedAt
    ? new Date(incident.resolvedAt).getTime() - new Date(incident.startedAt).getTime()
    : nowMs - new Date(incident.startedAt).getTime();
  const durationMin = Math.floor(durationMs / 60000);
  const durationStr =
    durationMin < 60
      ? `${durationMin} min`
      : `${Math.floor(durationMin / 60)}h ${durationMin % 60}min`;

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

      {/* Status flow stepper */}
      {(() => {
        const statusFlow = ["investigating", "monitoring", "resolved"] as const;
        const statusLabelMap: Record<string, string> = {
          investigating: "Vyšetřuje se",
          monitoring: "Monitoruje se",
          resolved: "Vyřešeno",
        };
        const currentIdx = statusFlow.indexOf(
          incident.status as (typeof statusFlow)[number]
        );
        return (
          <div className="flex items-center gap-0">
            {statusFlow.map((step, idx) => {
              const isPast = idx < currentIdx;
              const isCurrent = idx === currentIdx;
              return (
                <div key={step} className="flex items-center">
                  {idx > 0 && (
                    <div
                      className={`h-0.5 w-8 sm:w-12 ${
                        idx <= currentIdx
                          ? "bg-[hsl(var(--status-ok))]"
                          : "bg-border"
                      }`}
                    />
                  )}
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                        isPast
                          ? "bg-[hsl(var(--status-ok))] text-white"
                          : isCurrent
                          ? "bg-[hsl(var(--brand-primary))] text-white ring-2 ring-[hsl(var(--brand-primary)/0.3)] ring-offset-2 ring-offset-background"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isPast ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                    </div>
                    <span
                      className={`text-sm ${
                        isCurrent
                          ? "font-semibold text-foreground"
                          : isPast
                          ? "font-medium text-[hsl(var(--status-ok))]"
                          : "text-muted-foreground"
                      }`}
                    >
                      {statusLabelMap[step]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

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
          <CardContent className="space-y-1 pt-0 text-sm">
            <div className="text-lg font-semibold text-foreground">
              Trvání: {durationStr}
            </div>
            <div className="text-muted-foreground">Začátek: {formatDateTime(incident.startedAt)}</div>
            <div className="text-muted-foreground">{incident.resolvedAt ? `Konec: ${formatDateTime(incident.resolvedAt)}` : "Probíhá"}</div>
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
