import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CalendarClock, CheckCircle2, Rss } from "lucide-react";
import { StatusDot } from "@/components/ui/status-dot";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatRelativeTime } from "@/lib/utils";
import { generateHistoryBar, publicStatusData } from "@/lib/dashboard-data";
import { getBrandSettings } from "@/lib/branding";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrandSettings();
  return {
    title: "Status",
    description: `Aktuální stav služeb ${brand.tenantName}, plánovaná údržba a poslední incidenty.`,
  };
}

export const revalidate = 60;

const statusCopy = {
  ok: "Všechny služby běží normálně",
  warn: "Některé služby hlásí varování",
  down: "Probíhá incident",
} as const;

export default async function PublicStatusPage() {
  const brand = await getBrandSettings();
  const data = publicStatusData();
  const overall = data.overallStatus === "down" ? "down" : data.overallStatus === "warn" ? "warn" : "ok";
  const headline = statusCopy[overall];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 bg-background px-6 py-10">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span
            className={
              "inline-block h-2.5 w-2.5 rounded-full " +
              (overall === "ok"
                ? "bg-[hsl(var(--status-ok))]"
                : overall === "warn"
                ? "bg-[hsl(var(--status-warn))]"
                : "bg-[hsl(var(--status-down))]")
            }
            aria-hidden
          />
          {brand.tenantName} · status
        </div>
        <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground">
          Interní přihlášení
        </Link>
      </header>

      <section
        className={
          "flex items-center gap-3 rounded-lg border px-5 py-4 text-base font-medium " +
          (overall === "ok"
            ? "border-[hsl(var(--status-ok)/0.4)] bg-[hsl(var(--status-ok)/0.1)]"
            : overall === "warn"
            ? "border-[hsl(var(--status-warn)/0.4)] bg-[hsl(var(--status-warn)/0.1)]"
            : "border-[hsl(var(--status-down)/0.4)] bg-[hsl(var(--status-down)/0.1)]")
        }
        role="status"
      >
        {overall === "ok" ? (
          <CheckCircle2 className="h-5 w-5 text-[hsl(var(--status-ok))]" />
        ) : (
          <AlertTriangle
            className={
              overall === "warn"
                ? "h-5 w-5 text-[hsl(var(--status-warn))]"
                : "h-5 w-5 text-[hsl(var(--status-down))]"
            }
          />
        )}
        {headline}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Služby
        </h2>
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
          {data.services.map(({ app, health }) => {
            const history = generateHistoryBar(app.id);
            return (
              <li key={app.id} className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <StatusDot status={health?.status ?? "muted"} />
                    <span className="font-medium">{app.name}</span>
                    <span className="text-xs text-muted-foreground">{app.description}</span>
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-mono font-medium tabular-nums">
                      {(health?.uptimePct30d ?? 0).toFixed(2).replace(".", ",")} % / 30 dní
                    </div>
                    <div className="text-muted-foreground">{statusLabel(health?.status)}</div>
                  </div>
                </div>
                <div
                  className="mt-3 flex gap-[1px]"
                  role="img"
                  aria-label={`Historie 90 dní pro ${app.name}`}
                >
                  {history.map((s, i) => (
                    <span
                      key={i}
                      title={`Den ${90 - i}: ${statusLabel(s)}`}
                      className={
                        "h-6 flex-1 rounded-[1px] " +
                        (s === "ok"
                          ? "bg-[hsl(var(--status-ok)/0.6)]"
                          : s === "warn"
                          ? "bg-[hsl(var(--status-warn)/0.7)]"
                          : "bg-[hsl(var(--status-down)/0.7)]")
                      }
                    />
                  ))}
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                  <span>90 dní zpět</span>
                  <span>dnes</span>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {data.maintenance.length > 0 ? (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Plánovaná údržba
          </h2>
          <ul className="space-y-2">
            {data.maintenance.map((m) => (
              <li key={m.id} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                <CalendarClock className="h-5 w-5 text-[hsl(var(--status-info))]" />
                <div>
                  <div className="font-medium">{m.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDateTime(m.startsAt)} — {formatDateTime(m.endsAt)}
                  </div>
                  <p className="mt-1 text-sm">{m.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {data.activeIncidents.length > 0 ? (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Aktivní incidenty
          </h2>
          <ul className="space-y-3">
            {data.activeIncidents.map((inc) => (
              <li key={inc.id} className="rounded-lg border border-[hsl(var(--status-down)/0.4)] bg-[hsl(var(--status-down)/0.08)] p-4">
                <div className="flex items-center gap-2">
                  <Badge variant={inc.severity === "sev1" ? "danger" : "warning"}>{inc.severity.toUpperCase()}</Badge>
                  <span className="font-medium">{inc.title}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{inc.description}</p>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <div>Začátek: {formatDateTime(inc.startedAt)} ({formatRelativeTime(inc.startedAt)})</div>
                  {inc.updates.slice(-1).map((u) => (
                    <div key={u.at}>Poslední update ({formatRelativeTime(u.at)}): {u.message}</div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {data.resolvedIncidents.length > 0 ? (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Poslední vyřešené incidenty
          </h2>
          <ul className="space-y-2">
            {data.resolvedIncidents.map((inc) => (
              <li key={inc.id} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                <CheckCircle2 className="h-5 w-5 text-[hsl(var(--status-ok))]" />
                <div>
                  <div className="text-sm font-medium">{inc.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDateTime(inc.startedAt)} — vyřešeno {formatRelativeTime(inc.resolvedAt ?? inc.startedAt)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <footer className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
        <span>© {brand.productName} · interní monitoring {brand.tenantName}</span>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <Rss className="h-3 w-3" /> RSS
          </span>
          <span>Slack</span>
        </div>
      </footer>
    </main>
  );
}

function statusLabel(status?: string): string {
  switch (status) {
    case "ok":
      return "V pořádku";
    case "warn":
      return "Varování";
    case "down":
      return "Nedostupné";
    default:
      return "Neznámý";
  }
}
