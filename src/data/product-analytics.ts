export interface WeeklyMetrics {
  weekOf: string;
  dau: number;
  wau: number;
  sessionDurationAvgSec: number;
  bounceRatePct: number;
  nps: number;
}

export interface FeatureAdoption {
  feature: string;
  adoptionPct: number;
  weeklyActiveUsers: number;
  trend: "up" | "down" | "flat";
}

export interface FunnelStep {
  step: string;
  users: number;
  conversionPct: number;
}

export const weeklyMetrics: WeeklyMetrics[] = [
  {
    weekOf: "2026-03-24",
    dau: 1_240,
    wau: 4_820,
    sessionDurationAvgSec: 342,
    bounceRatePct: 32.1,
    nps: 41,
  },
  {
    weekOf: "2026-03-31",
    dau: 1_310,
    wau: 5_010,
    sessionDurationAvgSec: 358,
    bounceRatePct: 30.4,
    nps: 43,
  },
  {
    weekOf: "2026-04-07",
    dau: 1_285,
    wau: 4_950,
    sessionDurationAvgSec: 351,
    bounceRatePct: 31.2,
    nps: 42,
  },
  {
    weekOf: "2026-04-14",
    dau: 1_390,
    wau: 5_230,
    sessionDurationAvgSec: 365,
    bounceRatePct: 28.7,
    nps: 45,
  },
];

export const featureAdoption: FeatureAdoption[] = [
  { feature: "Slevové kódy", adoptionPct: 68, weeklyActiveUsers: 3_560, trend: "up" },
  { feature: "Offline cache (mobile)", adoptionPct: 23, weeklyActiveUsers: 1_200, trend: "up" },
  { feature: "Dark mode", adoptionPct: 41, weeklyActiveUsers: 2_150, trend: "flat" },
  { feature: "Rozšířené filtry", adoptionPct: 55, weeklyActiveUsers: 2_880, trend: "up" },
  { feature: "Export CSV", adoptionPct: 12, weeklyActiveUsers: 630, trend: "down" },
];

export const conversionFunnel: FunnelStep[] = [
  { step: "Návštěva homepage", users: 12_400, conversionPct: 100 },
  { step: "Prohlížení produktů", users: 8_680, conversionPct: 70.0 },
  { step: "Přidání do košíku", users: 3_472, conversionPct: 28.0 },
  { step: "Zahájení checkoutu", users: 2_083, conversionPct: 16.8 },
  { step: "Dokončení objednávky", users: 1_458, conversionPct: 11.8 },
];
