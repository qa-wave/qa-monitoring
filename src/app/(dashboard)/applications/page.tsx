import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusDot } from "@/components/ui/status-dot";
import { Badge } from "@/components/ui/badge";
import { applications } from "@/data/applications";
import { environments } from "@/data/environments";
import { healthChecks } from "@/data/health-checks";

export default function ApplicationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Aplikace"
        description="Všechny sledované aplikace napříč prostředími."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {applications.map((app) => {
          const appHealth = healthChecks.filter((h) => h.appId === app.id);
          const hasDown = appHealth.some((h) => h.status === "down");
          const hasWarn = appHealth.some((h) => h.status === "warn");
          const overall = hasDown ? "down" : hasWarn ? "warn" : "ok";
          return (
            <Link key={app.id} href={`/applications/${app.slug}`}>
              <Card className="transition-colors hover:border-accent">
                <CardHeader className="flex-row items-start justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {app.name}
                      <Badge variant="outline">{app.language}</Badge>
                    </CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{app.description}</p>
                  </div>
                  <StatusDot status={overall} size="lg" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap items-center gap-1 text-xs">
                    {environments
                      .filter((e) => app.environmentIds.includes(e.id))
                      .sort((a, b) => a.order - b.order)
                      .map((e) => {
                        const hc = appHealth.find((h) => h.envId === e.id);
                        return (
                          <Badge
                            key={e.id}
                            variant={
                              hc?.status === "down"
                                ? "danger"
                                : hc?.status === "warn"
                                ? "warning"
                                : hc?.status === "ok"
                                ? "success"
                                : "outline"
                            }
                          >
                            {e.name}
                          </Badge>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
