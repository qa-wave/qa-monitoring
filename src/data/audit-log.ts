import type { AuditEntry } from "@/lib/types";

const now = new Date("2026-04-17T12:44:00+02:00");
const minutesAgo = (m: number) => new Date(now.getTime() - m * 60_000).toISOString();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60_000).toISOString();

export const auditLog: AuditEntry[] = [
  { id: "a-1", at: minutesAgo(0), actor: "tomas", action: "deploy", target: "api v2026.4.17-1", envId: "env-prod", appId: "app-api" },
  { id: "a-2", at: minutesAgo(2), actor: "tomas", action: "deploy", target: "web v2026.4.17-1", envId: "env-prod", appId: "app-web" },
  { id: "a-3", at: minutesAgo(30), actor: "petra", action: "rollback", target: "worker v2026.4.16-3", envId: "env-prod", appId: "app-worker", details: "Reakce na incident #418" },
  { id: "a-4", at: minutesAgo(34), actor: "tomas", action: "flag.update", target: "new-checkout 50% → 100%", envId: "env-prod" },
  { id: "a-5", at: hoursAgo(1), actor: "kamila", action: "deploy", target: "web v2026.4.17-2", envId: "env-staging", appId: "app-web" },
  { id: "a-6", at: hoursAgo(2), actor: "jan", action: "deploy", target: "search v2026.4.17-0", envId: "env-staging", appId: "app-search" },
  { id: "a-7", at: hoursAgo(4), actor: "jan", action: "maintenance.schedule", target: "Aktualizace DB", envId: "env-prod", details: "20. 4. 23:00–01:00" },
];
