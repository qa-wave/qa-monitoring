import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatDuration, formatRelativeTime } from "@/lib/utils";
import { incidents } from "@/data/incidents";

export default function IncidentsPage() {
  const active = incidents.filter((i) => i.status !== "resolved");
  const resolved = incidents.filter((i) => i.status === "resolved");
  return (
    <div className="space-y-6">
      <PageHeader title="Incidenty" description="Aktivní incidenty a historie." />
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Aktivní incidenty</CardTitle>
          <Badge variant={active.length > 0 ? "danger" : "outline"}>{active.length}</Badge>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {active.length === 0 ? (
            <p className="text-sm text-muted-foreground">Žádné aktivní incidenty.</p>
          ) : (
            active.map((inc) => (
              <Link
                key={inc.id}
                href={`/incidents/${inc.id}`}
                className="block rounded-md border border-border p-3 transition-colors hover:bg-accent/40"
              >
                <div className="flex items-center gap-2">
                  <Badge variant={inc.severity === "sev1" ? "danger" : "warning"}>{inc.severity.toUpperCase()}</Badge>
                  <span className="font-medium">{inc.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    začátek {formatRelativeTime(inc.startedAt)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{inc.description}</p>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Historie</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border/60 pt-0 text-sm">
          {resolved.map((inc) => {
            const duration = inc.resolvedAt
              ? Math.round((new Date(inc.resolvedAt).getTime() - new Date(inc.startedAt).getTime()) / 1000)
              : 0;
            return (
              <Link
                key={inc.id}
                href={`/incidents/${inc.id}`}
                className="flex items-center gap-3 py-3"
              >
                <Badge variant="outline">{inc.severity.toUpperCase()}</Badge>
                <span className="flex-1 font-medium">{inc.title}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(inc.startedAt)} · trvání {formatDuration(duration)}
                </span>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
