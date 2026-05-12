import type { Incident } from "@/lib/types";

const now = new Date();
const minutesAgo = (m: number) => new Date(now.getTime() - m * 60_000).toISOString();
const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60_000).toISOString();

export const incidents: Incident[] = [
  {
    id: "inc-418",
    title: "Worker v prod neprovádí úlohy",
    description:
      "Fronta úloh roste — worker podrží prvních 10 zpráv a pak přestane konzumovat. Tým platformy šetří.",
    severity: "sev1",
    status: "investigating",
    startedAt: minutesAgo(12),
    resolvedAt: null,
    affectedAppIds: ["app-worker", "app-payments"],
    affectedEnvIds: ["env-prod"],
    isPublic: true,
    updates: [
      { at: minutesAgo(12), author: "pager", message: "Alert: queue_length > 5000 po dobu 2 min." },
      { at: minutesAgo(10), author: "petra", message: "Přebírám na sebe, kontroluji consumer groupy." },
      { at: minutesAgo(4), author: "petra", message: "Rollback deploye `worker v2026.4.16-3` právě probíhá." },
    ],
  },
  {
    id: "inc-417",
    title: "Pomalý checkout v prod",
    description: "Pozorujeme p95 latenci > 500 ms na /checkout endpointu. Frontend zobrazuje spinner.",
    severity: "sev2",
    status: "monitoring",
    startedAt: minutesAgo(95),
    resolvedAt: null,
    affectedAppIds: ["app-web", "app-payments"],
    affectedEnvIds: ["env-prod"],
    isPublic: true,
    updates: [
      { at: minutesAgo(95), author: "alert", message: "Pingdom: response time > 3s na /api/checkout." },
      { at: minutesAgo(80), author: "jan", message: "Identifikováno N+1 query v payment-service." },
      { at: minutesAgo(25), author: "jan", message: "Hotfix deployed, metriky se vrací." },
    ],
  },
  {
    id: "inc-411",
    title: "Pokles uptime API",
    description: "API v prod vykazovalo 502 odpovědi během deploye.",
    severity: "sev2",
    status: "resolved",
    startedAt: daysAgo(3),
    resolvedAt: daysAgo(3),
    affectedAppIds: ["app-api"],
    affectedEnvIds: ["env-prod"],
    isPublic: true,
    postmortemUrl: "https://example.com/postmortems/inc-411",
    updates: [
      { at: daysAgo(3), author: "alert", message: "Uptime check selhal." },
      { at: daysAgo(3), author: "kamila", message: "Rolling deploy nedokončil graceful shutdown; vráceno." },
    ],
  },
  {
    id: "inc-405",
    title: "Dočasné výpadky mobile-bff",
    description: "Rate-limit ze strany upstream API.",
    severity: "sev3",
    status: "resolved",
    startedAt: daysAgo(7),
    resolvedAt: daysAgo(7),
    affectedAppIds: ["app-mobile-bff"],
    affectedEnvIds: ["env-prod"],
    isPublic: false,
    updates: [
      { at: daysAgo(7), author: "alert", message: "429 odpovědi z payments upstream." },
    ],
  },
];

export function activeIncidents(): Incident[] {
  return incidents.filter((i) => i.status !== "resolved");
}
