import { Rocket, CheckCircle2, RotateCcw, GitPullRequest } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ReleaseListItem } from "@/components/dashboard/ReleaseListItem";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
            <div key={release.id}>
              <ReleaseListItem release={release} />
              {release.linkedPrIds.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 px-2 pb-2">
                  {release.linkedPrIds.map((prId) => (
                    <a
                      key={prId}
                      href={`https://github.com/example/monorepo/pull/${prId.replace("PR-", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Badge variant="outline" className="gap-1 hover:bg-accent">
                        <GitPullRequest className="h-3 w-3" />
                        {prId}
                      </Badge>
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
