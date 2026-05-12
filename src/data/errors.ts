import type { ErrorSummary } from "@/lib/types";

const now = new Date();
const minutesAgo = (m: number) => new Date(now.getTime() - m * 60_000).toISOString();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60_000).toISOString();

export const errorSummaries: ErrorSummary[] = [
  {
    id: "e-1",
    appId: "app-payments",
    envId: "env-prod",
    title: "TypeError: Cannot read properties of undefined (reading 'amount')",
    fingerprint: "payments:checkout:amount",
    level: "error",
    count24h: 43,
    firstSeen: hoursAgo(1),
    lastSeen: minutesAgo(3),
    usersAffected: 12,
    release: "v2026.4.17-1",
    url: "https://sentry.io/issues/payments/12345",
  },
  {
    id: "e-2",
    appId: "app-web",
    envId: "env-prod",
    title: "ChunkLoadError: Loading chunk 42 failed",
    fingerprint: "web:chunk:42",
    level: "warning",
    count24h: 118,
    firstSeen: hoursAgo(6),
    lastSeen: minutesAgo(5),
    usersAffected: 89,
    release: "v2026.4.17-1",
    url: "https://sentry.io/issues/web/12346",
  },
  {
    id: "e-3",
    appId: "app-worker",
    envId: "env-prod",
    title: "RedisConnectionError: ECONNREFUSED",
    fingerprint: "worker:redis:connect",
    level: "fatal",
    count24h: 231,
    firstSeen: minutesAgo(14),
    lastSeen: minutesAgo(1),
    usersAffected: 0,
    release: "v2026.4.16-3",
    url: "https://sentry.io/issues/worker/12347",
  },
];
