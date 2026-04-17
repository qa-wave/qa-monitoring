import type { Release } from "@/lib/types";

const now = new Date("2026-04-17T12:44:00+02:00");
const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60_000).toISOString();
const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60_000).toISOString();

export const releases: Release[] = [
  {
    id: "rel-2026-4-17-1",
    version: "v2026.4.17-1",
    title: "Slevové kódy v košíku",
    notes:
      "Přidána podpora slevových kódů v checkout flow. Refaktor payment-service s opravou N+1.",
    createdAt: hoursAgo(2),
    appIds: ["app-web", "app-api", "app-payments"],
    environmentIds: ["env-staging", "env-preprod", "env-prod"],
    linkedPrIds: ["PR-2144", "PR-2146", "PR-2148"],
    linkedIssueIds: ["ISSUE-887"],
    status: "released",
  },
  {
    id: "rel-2026-4-17-0",
    version: "v2026.4.17-0",
    title: "Offline cache v mobilní BFF",
    notes: "Mobilní BFF umí odpovídat z cache pokud upstream selže (best-effort).",
    createdAt: hoursAgo(6),
    appIds: ["app-mobile-bff"],
    environmentIds: ["env-staging", "env-prod"],
    linkedPrIds: ["PR-2141"],
    linkedIssueIds: ["ISSUE-881"],
    status: "released",
  },
  {
    id: "rel-2026-4-16-3",
    version: "v2026.4.16-3",
    title: "Retry worker — CHYBNÝ RELEASE",
    notes: "Rollbacknuto; worker s tímto releasem přestane konzumovat. Viz incident #418.",
    createdAt: daysAgo(1),
    appIds: ["app-worker"],
    environmentIds: ["env-prod"],
    linkedPrIds: ["PR-2139"],
    linkedIssueIds: ["ISSUE-879"],
    status: "rolled_back",
  },
  {
    id: "rel-2026-4-15-2",
    version: "v2026.4.15-2",
    title: "Upgrade Meilisearch",
    notes: "Search index migrace na v1.11.",
    createdAt: daysAgo(2),
    appIds: ["app-search"],
    environmentIds: ["env-staging", "env-prod"],
    linkedPrIds: ["PR-2130"],
    linkedIssueIds: [],
    status: "released",
  },
  {
    id: "rel-2026-4-14-1",
    version: "v2026.4.14-1",
    title: "Push notifikace v notifier",
    notes: "Přidána podpora Apple Push Notification Service.",
    createdAt: daysAgo(3),
    appIds: ["app-notifier"],
    environmentIds: ["env-staging", "env-prod"],
    linkedPrIds: ["PR-2122", "PR-2123"],
    linkedIssueIds: ["ISSUE-854"],
    status: "released",
  },
];
