import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusDot } from "@/components/ui/status-dot";
import { Badge } from "@/components/ui/badge";
import { environments } from "@/data/environments";
import { applications } from "@/data/applications";
import { healthChecks } from "@/data/health-checks";
import { getT } from "@/lib/i18n/server";

export default async function EnvironmentsPage() {
  const { t } = await getT();
  return (
    <div className="space-y-6">
      <PageHeader
        title={t.pages.environments.title}
        description={t.pages.environments.description}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {environments.map((env) => {
          const envApps = applications.filter((a) => a.environmentIds.includes(env.id));
          const envHealth = healthChecks.filter((h) => h.envId === env.id);
          const hasDown = envHealth.some((h) => h.status === "down");
          const hasWarn = envHealth.some((h) => h.status === "warn");
          const overall = hasDown ? "down" : hasWarn ? "warn" : "ok";
          const avgUptime = envHealth.length
            ? envHealth.reduce((a, h) => a + h.uptimePct30d, 0) / envHealth.length
            : 0;
          return (
            <Link key={env.id} href={`/environments/${env.slug}`}>
              <Card className="transition-colors hover:border-accent">
                <CardHeader className="flex-row items-start justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {env.name}
                      {env.isProduction ? <Badge variant="info">prod</Badge> : null}
                    </CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">{env.url}</p>
                  </div>
                  <StatusDot status={overall} size="lg" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Aplikací: {envApps.length}</span>
                    <span>Uptime 30d: {avgUptime.toFixed(2).replace(".", ",")} %</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {envApps.slice(0, 6).map((a) => {
                      const hc = envHealth.find((h) => h.appId === a.id);
                      return (
                        <Badge
                          key={a.id}
                          variant={
                            hc?.status === "down"
                              ? "danger"
                              : hc?.status === "warn"
                              ? "warning"
                              : "outline"
                          }
                        >
                          {a.name}
                        </Badge>
                      );
                    })}
                    {envApps.length > 6 ? <Badge variant="outline">+{envApps.length - 6}</Badge> : null}
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
