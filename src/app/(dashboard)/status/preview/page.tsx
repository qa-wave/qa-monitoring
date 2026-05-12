import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { publicStatusData } from "@/lib/dashboard-data";
import { incidents } from "@/data/incidents";
import { plannedMaintenance } from "@/data/maintenance";
import { getT } from "@/lib/i18n/server";

export default async function StatusPreviewPage() {
  const { t } = await getT();
  const publicData = publicStatusData();
  const privateIncidents = incidents.filter((i) => !i.isPublic);
  const privateMaintenance = plannedMaintenance.filter((m) => !m.isPublic);
  return (
    <div className="space-y-6">
      <PageHeader
        title={t.pages.statusPreview.title}
        description={t.pages.statusPreview.description}
        actions={
          <a
            href="/status"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-md border border-input px-3 py-1.5 text-xs font-medium hover:bg-accent"
          >
            Otevřít veřejnou verzi ↗
          </a>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Veřejné služby</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border/60 pt-0 text-sm">
            {publicData.services.map(({ app, health }) => (
              <div key={app.id} className="flex items-center justify-between py-2">
                <span className="font-medium">{app.name}</span>
                <Badge
                  variant={
                    health?.status === "down" ? "danger" : health?.status === "warn" ? "warning" : "success"
                  }
                >
                  {health?.status === "down"
                    ? "nedostupné"
                    : health?.status === "warn"
                    ? "varování"
                    : "ok"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interní-only incidenty</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border/60 pt-0 text-sm">
            {privateIncidents.length === 0 ? (
              <p className="py-2 text-muted-foreground">Žádné skryté incidenty.</p>
            ) : (
              privateIncidents.map((inc) => (
                <div key={inc.id} className="py-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="warning">{inc.severity.toUpperCase()}</Badge>
                    <span className="font-medium">{inc.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{inc.description}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plánovaná údržba</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0 text-sm">
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Veřejná</h3>
            {publicData.maintenance.map((m) => (
              <div key={m.id} className="py-1">
                <div className="font-medium">{m.title}</div>
                <div className="text-xs text-muted-foreground">
                  {formatDateTime(m.startsAt)} — {formatDateTime(m.endsAt)}
                </div>
              </div>
            ))}
          </div>
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Interní-only
            </h3>
            {privateMaintenance.length === 0 ? (
              <p className="text-muted-foreground">Žádná.</p>
            ) : (
              privateMaintenance.map((m) => (
                <div key={m.id} className="py-1">
                  <div className="font-medium">{m.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDateTime(m.startsAt)} — {formatDateTime(m.endsAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
