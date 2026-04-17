import { applications } from "@/data/applications";
import { auditLog } from "@/data/audit-log";
import { deployments } from "@/data/deployments";
import { errorSummaries } from "@/data/errors";
import { featureFlags } from "@/data/feature-flags";
import { environments } from "@/data/environments";
import {
  computeAverageLatency,
  computeOverallUptime,
  getHealth,
  healthChecks,
} from "@/data/health-checks";
import { activeIncidents, incidents } from "@/data/incidents";
import { pipelineRuns } from "@/data/pipeline-runs";
import { plannedMaintenance } from "@/data/maintenance";
import { releases } from "@/data/releases";
import { computeOverallPassRate, testRuns } from "@/data/test-runs";
import type { Deployment, StatusKind } from "@/lib/types";

export function overviewData(envSlug?: string) {
  const filteredEnv = envSlug ? environments.find((e) => e.slug === envSlug) : undefined;

  const uptime = computeOverallUptime();
  const p95 = computeAverageLatency(filteredEnv?.slug);
  const errorCount = errorSummaries.reduce((a, e) => a + e.count24h, 0);
  const requestsEstimate = 50_000;
  const errorRate = (errorCount / requestsEstimate) * 100;
  const now = new Date("2026-04-17T12:44:00+02:00");
  const deploysToday = deployments.filter((d) => {
    const ds = new Date(d.startedAt);
    return ds.toDateString() === now.toDateString();
  }).length;

  return {
    uptime,
    p95,
    errorRate,
    errorCount,
    deploysToday,
    passRate: computeOverallPassRate(),
    environments: filteredEnv ? [filteredEnv] : environments,
    allEnvironments: environments,
    applications,
    healthChecks,
    incidents: activeIncidents(),
    recentReleases: releases.slice(0, 5),
    recentTestRuns: testRuns.filter((t) => t.envId === "env-prod").slice(0, 6),
    flags: featureFlags,
    activePrimaryIncident: activeIncidents().find((i) => i.severity === "sev1") ?? activeIncidents()[0],
    auditLog: auditLog.slice(0, 8),
    errorSummaries,
  };
}

export function environmentDetailData(envSlug: string) {
  const env = environments.find((e) => e.slug === envSlug);
  if (!env) return null;
  const envApps = applications.filter((a) => a.environmentIds.includes(env.id));
  const envHealthChecks = healthChecks.filter((h) => h.envId === env.id);
  const envTestRuns = testRuns.filter((t) => t.envId === env.id);
  const envFlags = featureFlags.filter((f) => f.envStates.some((s) => s.envId === env.id));
  const envDeployments = deployments.filter((d) => d.envId === env.id);
  const envIncidents = incidents.filter((i) => i.affectedEnvIds.includes(env.id));
  const envPipelineRuns = pipelineRuns.filter((p) => p.envId === env.id);
  const envErrors = errorSummaries.filter((e) => e.envId === env.id);

  return {
    environment: env,
    applications: envApps,
    healthChecks: envHealthChecks,
    testRuns: envTestRuns,
    flags: envFlags,
    deployments: envDeployments,
    incidents: envIncidents,
    pipelineRuns: envPipelineRuns,
    errors: envErrors,
    auditLog: auditLog.filter((a) => a.envId === env.id).slice(0, 10),
  };
}

export function pipelineLatestByEnv(): Record<string, { status: StatusKind; version: string; when: string }> {
  const out: Record<string, { status: StatusKind; version: string; when: string }> = {};
  for (const env of environments) {
    const envDeployments = deployments.filter((d) => d.envId === env.id).sort(sortByStartedDesc);
    const latest: Deployment | undefined = envDeployments[0];
    if (!latest) continue;
    const status: StatusKind =
      latest.status === "failed" || latest.status === "rolled_back"
        ? "down"
        : latest.status === "pending"
        ? "pending"
        : "ok";
    out[env.id] = {
      status,
      version: latest.version,
      when: new Date(latest.finishedAt ?? latest.startedAt).toLocaleTimeString("cs-CZ", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  }
  return out;
}

function sortByStartedDesc(a: Deployment, b: Deployment) {
  return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
}

export function applicationDetailData(appSlug: string) {
  const app = applications.find((a) => a.slug === appSlug);
  if (!app) return null;
  const perEnv = environments
    .filter((e) => app.environmentIds.includes(e.id))
    .map((env) => {
      const hc = getHealth(app.id, env.id);
      const latestDeploy = deployments
        .filter((d) => d.appId === app.id && d.envId === env.id)
        .sort(sortByStartedDesc)[0];
      const tests = testRuns.filter((t) => t.appId === app.id && t.envId === env.id);
      return { env, health: hc, latestDeploy, tests };
    });
  const appIncidents = incidents.filter((i) => i.affectedAppIds.includes(app.id));
  const appErrors = errorSummaries.filter((e) => e.appId === app.id);
  return { application: app, perEnv, incidents: appIncidents, errors: appErrors };
}

export function publicStatusData() {
  const publicIncidents = incidents.filter((i) => i.isPublic);
  const publicMaintenance = plannedMaintenance.filter((m) => m.isPublic);
  const services = applications
    .filter((a) => a.tags.includes("customer-facing") || a.tags.includes("critical") || a.slug === "api" || a.slug === "mobile-bff")
    .map((app) => {
      const hc = getHealth(app.id, "env-prod");
      return { app, health: hc };
    });
  const overallStatus: StatusKind = services.some((s) => s.health?.status === "down")
    ? "down"
    : services.some((s) => s.health?.status === "warn")
    ? "warn"
    : "ok";
  return {
    overallStatus,
    services,
    activeIncidents: publicIncidents.filter((i) => i.status !== "resolved"),
    resolvedIncidents: publicIncidents.filter((i) => i.status === "resolved").slice(0, 5),
    maintenance: publicMaintenance,
  };
}

/**
 * Generuje deterministickou pseudo-náhodnou historii uptime na 90 dní
 * pro vizualizaci na /status history baru.
 */
export function generateHistoryBar(seed: string, days = 90): StatusKind[] {
  const out: StatusKind[] = [];
  let s = 0;
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
  for (let i = 0; i < days; i++) {
    s = (s * 1103515245 + 12345) >>> 0;
    const r = (s >>> 16) & 0xffff;
    if (r < 500) out.push("down");
    else if (r < 2500) out.push("warn");
    else out.push("ok");
  }
  return out;
}
