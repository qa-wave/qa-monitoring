import type { PipelineRun } from "@/lib/types";
import { applications } from "./applications";

const now = new Date("2026-04-17T12:44:00+02:00");
const minutesAgo = (m: number) => new Date(now.getTime() - m * 60_000).toISOString();

const runs: PipelineRun[] = [];
let id = 1;

for (const app of applications) {
  runs.push({
    id: `pr-${id++}`,
    appId: app.id,
    envId: "env-prod",
    branch: "main",
    commitSha: "a1b2c3d4",
    actor: "tomas",
    status: "success",
    startedAt: minutesAgo(20 + id),
    durationSec: 145,
    url: `${app.repoUrl}/actions/runs/${9000 + id}`,
  });
}

// Jeden běžící a jeden failed
runs.push({
  id: "pr-90",
  appId: "app-web",
  envId: "env-staging",
  branch: "feat/discount-codes",
  commitSha: "dead0001",
  actor: "petra",
  status: "running",
  startedAt: minutesAgo(2),
  durationSec: 0,
  url: "https://github.com/example/web/actions/runs/9090",
});

runs.push({
  id: "pr-91",
  appId: "app-worker",
  envId: "env-staging",
  branch: "main",
  commitSha: "beef0002",
  actor: "jan",
  status: "failed",
  startedAt: minutesAgo(14),
  durationSec: 72,
  url: "https://github.com/example/worker/actions/runs/9091",
});

export const pipelineRuns: PipelineRun[] = runs;
