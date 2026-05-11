import { Rocket, CheckCircle2, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ReleaseListItem } from "@/components/dashboard/ReleaseListItem";
import { Card, CardContent } from "@/components/ui/card";
import { releases } from "@/data/releases";

export default function ReleasesPage() {
  const total = releases.length;
  const successful = releases.filter((r) => r.status === "released").length;
  const rolledBack = releases.filter((r) => r.status === "rolled_back").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Releasy"
        description="Časová osa releasů s propojenými PR a ticketami."
      />
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Celkem releasů"
          value={String(total)}
          status="info"
          icon={Rocket}
        />
        <KpiCard
          label="Úspěšné"
          value={String(successful)}
          status="ok"
          icon={CheckCircle2}
        />
        <KpiCard
          label="Rollbacknuté"
          value={String(rolledBack)}
          status={rolledBack > 0 ? "warn" : "ok"}
          icon={RotateCcw}
        />
      </section>
      <Card>
        <CardContent className="divide-y divide-border/60 p-2">
          {releases.map((release) => (
            <ReleaseListItem key={release.id} release={release} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
