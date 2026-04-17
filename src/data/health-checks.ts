import type { HealthCheck } from "@/lib/types";
import { applications } from "./applications";
import { environments } from "./environments";

const now = new Date("2026-04-17T12:44:00+02:00");
const secondsAgo = (s: number) => new Date(now.getTime() - s * 1000).toISOString();

type Override = { appId: string; envId: string; status: HealthCheck["status"]; latencyMs?: number; uptime?: number; message?: string };

const overrides: Override[] = [
  { appId: "app-api", envId: "env-staging", status: "warn", latencyMs: 542, uptime: 99.32, message: "Zvýšená latence nad 500 ms" },
  { appId: "app-worker", envId: "env-prod", status: "down", latencyMs: 0, uptime: 98.12, message: "Worker neprovádí žádné úlohy posledních 12 min" },
  { appId: "app-payments", envId: "env-prod", status: "ok", latencyMs: 97, uptime: 99.99 },
  { appId: "app-search", envId: "env-staging", status: "warn", latencyMs: 321, uptime: 99.76, message: "Reindex v průběhu" },
];

export const healthChecks: HealthCheck[] = [];

for (const app of applications) {
  for (const envId of app.environmentIds) {
    const override = overrides.find((o) => o.appId === app.id && o.envId === envId);
    healthChecks.push({
      id: `hc-${app.id}-${envId}`,
      appId: app.id,
      envId,
      kind: "http",
      status: override?.status ?? "ok",
      latencyMs: override?.latencyMs ?? Math.round(120 + Math.random() * 200),
      uptimePct30d: override?.uptime ?? 99.94,
      checkedAt: secondsAgo(15),
      message: override?.message,
    });
  }
}

export function getHealth(appId: string, envId: string): HealthCheck | undefined {
  return healthChecks.find((h) => h.appId === appId && h.envId === envId);
}

// Pomocné agregáty pro KPI řadu
export function computeOverallUptime(): number {
  if (healthChecks.length === 0) return 0;
  return healthChecks.reduce((acc, h) => acc + h.uptimePct30d, 0) / healthChecks.length;
}

export function computeAverageLatency(envSlug?: string): number {
  const relevant = envSlug
    ? healthChecks.filter((h) => {
        const env = environments.find((e) => e.id === h.envId);
        return env?.slug === envSlug;
      })
    : healthChecks;
  if (relevant.length === 0) return 0;
  const sorted = [...relevant].map((h) => h.latencyMs).sort((a, b) => a - b);
  const idx = Math.floor(sorted.length * 0.95);
  return sorted[idx] ?? sorted[sorted.length - 1];
}
