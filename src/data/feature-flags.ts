import type { FeatureFlag } from "@/lib/types";

const now = new Date("2026-04-17T12:10:00+02:00");
const iso = (d: Date) => d.toISOString();
const daysAgo = (d: number) => iso(new Date(now.getTime() - d * 24 * 60 * 60_000));

export const featureFlags: FeatureFlag[] = [
  {
    id: "ff-1",
    key: "new-checkout",
    name: "Nový checkout flow",
    description: "Redesign pokladny s slevovými kódy a rychlejší validací.",
    envStates: [
      { envId: "env-dev", on: true, rolloutPct: 100 },
      { envId: "env-staging", on: true, rolloutPct: 100 },
      { envId: "env-preprod", on: true, rolloutPct: 100 },
      { envId: "env-prod", on: true, rolloutPct: 100 },
    ],
    updatedAt: iso(now),
    updatedBy: "tomas",
  },
  {
    id: "ff-2",
    key: "dark-mode",
    name: "Tmavý režim",
    description: "Vypnutelný tmavý motiv UI.",
    envStates: [
      { envId: "env-dev", on: true, rolloutPct: 100 },
      { envId: "env-staging", on: true, rolloutPct: 50 },
      { envId: "env-preprod", on: false, rolloutPct: 0 },
      { envId: "env-prod", on: false, rolloutPct: 0 },
    ],
    updatedAt: daysAgo(3),
    updatedBy: "kamila",
  },
  {
    id: "ff-3",
    key: "beta-search",
    name: "Nové vyhledávání",
    description: "Vektorové vyhledávání přes embeddingy.",
    envStates: [
      { envId: "env-dev", on: true, rolloutPct: 100 },
      { envId: "env-staging", on: true, rolloutPct: 100 },
      { envId: "env-preprod", on: true, rolloutPct: 50 },
      { envId: "env-prod", on: true, rolloutPct: 25 },
    ],
    updatedAt: daysAgo(1),
    updatedBy: "jan",
  },
  {
    id: "ff-4",
    key: "ap-push-notifications",
    name: "APNs push",
    description: "Vypnout / zapnout APNs pro mobilní klienty.",
    envStates: [
      { envId: "env-dev", on: true, rolloutPct: 100 },
      { envId: "env-staging", on: true, rolloutPct: 100 },
      { envId: "env-preprod", on: true, rolloutPct: 100 },
      { envId: "env-prod", on: true, rolloutPct: 100 },
    ],
    updatedAt: daysAgo(3),
    updatedBy: "petra",
  },
];
