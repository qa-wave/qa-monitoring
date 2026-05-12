import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusDot, type StatusKind } from "@/components/ui/status-dot";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Application, Environment, HealthCheck } from "@/lib/types";

interface StatusMatrixProps {
  applications: Application[];
  environments: Environment[];
  healthChecks: HealthCheck[];
  className?: string;
}

export function StatusMatrix({ applications, environments, healthChecks, className }: StatusMatrixProps) {
  const envs = [...environments].sort((a, b) => a.order - b.order);

  const byKey = new Map<string, HealthCheck>();
  for (const hc of healthChecks) {
    byKey.set(`${hc.appId}:${hc.envId}`, hc);
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Prostředí × aplikace</CardTitle>
        <span className="text-xs text-muted-foreground">Klikni na buňku pro detail</span>
      </CardHeader>
      <CardContent className="overflow-x-auto pt-0">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th scope="col" className="w-40 pb-2 pr-4 font-medium">Aplikace</th>
              {envs.map((e) => (
                <th key={e.id} scope="col" className="px-2 pb-2 font-medium">
                  <span className="inline-flex items-center gap-2">
                    {e.name}
                    {e.isProduction ? (
                      <span className="rounded-sm bg-[hsl(var(--status-info)/0.15)] px-1.5 py-0.5 text-[10px] font-medium text-[hsl(var(--status-info))]">
                        prod
                      </span>
                    ) : null}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <TooltipProvider>
              {applications.map((app) => (
                <tr key={app.id} className="border-t border-border/60">
                  <td scope="row" className="py-3 pr-4 font-medium">
                    <Link href={`/applications/${app.slug}`} className="hover:underline">
                      {app.name}
                    </Link>
                  </td>
                  {envs.map((e) => {
                    const hc = byKey.get(`${app.id}:${e.id}`);
                    const status: StatusKind = hc?.status ?? (app.environmentIds.includes(e.id) ? "muted" : "muted");
                    const deployed = app.environmentIds.includes(e.id);
                    return (
                      <td
                        key={e.id}
                        className="px-2 py-3"
                        aria-label={deployed && hc ? `${app.name} v ${e.name}: ${status}, ${hc.latencyMs ?? "—"}ms` : undefined}
                      >
                        {deployed ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link
                                href={`/applications/${app.slug}?env=${e.slug}`}
                                className={cn(
                                  "inline-flex items-center gap-2 rounded-md border border-transparent px-2 py-1 text-xs transition-colors hover:border-border hover:bg-accent/50"
                                )}
                              >
                                <StatusDot status={status} />
                                {hc?.latencyMs != null ? (
                                  <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                                    {hc.latencyMs} ms
                                  </span>
                                ) : null}
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs space-y-1">
                              <div className="font-semibold">
                                {app.name} · {e.name}
                              </div>
                              <div className="text-muted-foreground">
                                {statusCopy(status)} · uptime {hc?.uptimePct30d.toFixed(2).replace(".", ",")} %
                              </div>
                              {hc?.message ? <div>{hc.message}</div> : null}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="text-xs text-muted-foreground/60">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </TooltipProvider>
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function statusCopy(status: StatusKind): string {
  switch (status) {
    case "ok":
      return "V pořádku";
    case "warn":
      return "Varování";
    case "down":
      return "Nedostupné";
    case "info":
      return "Informace";
    default:
      return "Neznámý stav";
  }
}
