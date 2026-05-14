import type { TestRun } from "@/lib/types";
import { applications } from "./applications";

const now = new Date();
const minutesAgo = (m: number) => new Date(now.getTime() - m * 60_000).toISOString();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60_000).toISOString();

type Suite = TestRun["suite"];

const suiteDefaults: Record<Suite, { dur: number; coverage: number | null; pass: number }> = {
  unit: { dur: 45, coverage: 82, pass: 4120 },
  integration: { dur: 180, coverage: 71, pass: 312 },
  e2e: { dur: 360, coverage: null, pass: 180 },
  smoke: { dur: 30, coverage: null, pass: 42 },
  load: { dur: 900, coverage: null, pass: 1 },
};

const runs: TestRun[] = [];
let id = 1;

for (const app of applications.slice(0, 6)) {
  for (const envId of app.environmentIds) {
    const suites: Suite[] = ["unit", "integration", "e2e", "smoke"];
    for (const suite of suites) {
      const defaults = suiteDefaults[suite];
      const fail = suite === "e2e" && app.id === "app-api" ? 2 : 0;
      const flaky = suite === "e2e" ? 3 : 0;
      const skipped = suite === "unit" ? 8 : suite === "integration" ? 3 : 0;
      const status: TestRun["status"] = fail > 0 ? "warn" : "ok";
      runs.push({
        id: `tr-${id++}`,
        appId: app.id,
        envId,
        suite,
        passed: defaults.pass - fail,
        failed: fail,
        flaky,
        skipped,
        coveragePct: defaults.coverage,
        durationSec: defaults.dur,
        runAt: envId === "env-prod" ? minutesAgo(3 + id) : hoursAgo(1 + (id % 5)),
        reportUrl: `https://reports.example.com/${app.slug}/${envId}/${suite}/${id}`,
        status,
      });
    }
  }
}

// Přidej jednu load run pro payments v prod
runs.push({
  id: `tr-${id++}`,
  appId: "app-payments",
  envId: "env-prod",
  suite: "load",
  passed: 1,
  failed: 0,
  flaky: 0,
  skipped: 0,
  coveragePct: null,
  durationSec: 900,
  runAt: hoursAgo(12),
  reportUrl: "https://reports.example.com/payments/env-prod/load/1",
  status: "ok",
});

export const testRuns: TestRun[] = runs;

export function computeOverallPassRate(): number {
  const passed = runs.reduce((a, r) => a + r.passed, 0);
  const failed = runs.reduce((a, r) => a + r.failed, 0);
  const total = passed + failed;
  return total === 0 ? 100 : (passed / total) * 100;
}
