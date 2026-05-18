import { readJson, writeJson } from "@/lib/storage";
import type {
  Deployment,
  ErrorSummary,
  FeatureFlag,
  HealthCheck,
  Incident,
  PipelineRun,
  TestRun,
} from "@/lib/types";

const STORE_KEY = "ingested-data.json";
const MAX_RUNS = 100;

export interface IngestedData {
  deployments: Deployment[];
  healthChecks: HealthCheck[];
  errorSummaries: ErrorSummary[];
  pipelineRuns: PipelineRun[];
  featureFlags: FeatureFlag[];
  testRuns: TestRun[];
  incidents: Incident[];
  runs: IngestRun[];
  updatedAt: string | null;
}

export interface IngestRun {
  id: string;
  integrationId: string;
  providerKey: string;
  status: "success" | "partial" | "error" | "skipped";
  startedAt: string;
  finishedAt: string;
  counts: Record<string, number>;
  message?: string;
}

export type IngestPayload = Partial<
  Pick<
    IngestedData,
    | "deployments"
    | "healthChecks"
    | "errorSummaries"
    | "pipelineRuns"
    | "featureFlags"
    | "testRuns"
    | "incidents"
  >
>;

const EMPTY_DATA: IngestedData = {
  deployments: [],
  healthChecks: [],
  errorSummaries: [],
  pipelineRuns: [],
  featureFlags: [],
  testRuns: [],
  incidents: [],
  runs: [],
  updatedAt: null,
};

function upsertById<T extends { id: string }>(current: T[], incoming: T[]): T[] {
  if (incoming.length === 0) return current;
  const byId = new Map(current.map((item) => [item.id, item]));
  for (const item of incoming) byId.set(item.id, item);
  return [...byId.values()];
}

export async function readIngestedData(): Promise<IngestedData> {
  const data = await readJson<IngestedData>(STORE_KEY, EMPTY_DATA);
  return {
    ...EMPTY_DATA,
    ...data,
    runs: data.runs ?? [],
  };
}

export async function upsertIngestedData(
  payload: IngestPayload,
  run: IngestRun,
): Promise<IngestedData> {
  const current = await readIngestedData();
  const next: IngestedData = {
    deployments: upsertById(current.deployments, payload.deployments ?? []),
    healthChecks: upsertById(current.healthChecks, payload.healthChecks ?? []),
    errorSummaries: upsertById(current.errorSummaries, payload.errorSummaries ?? []),
    pipelineRuns: upsertById(current.pipelineRuns, payload.pipelineRuns ?? []),
    featureFlags: upsertById(current.featureFlags, payload.featureFlags ?? []),
    testRuns: upsertById(current.testRuns, payload.testRuns ?? []),
    incidents: upsertById(current.incidents, payload.incidents ?? []),
    runs: [run, ...current.runs].slice(0, MAX_RUNS),
    updatedAt: run.finishedAt,
  };
  await writeJson(STORE_KEY, next);
  return next;
}

export async function listIngestRuns(limit = 20): Promise<IngestRun[]> {
  const data = await readIngestedData();
  return data.runs.slice(0, limit);
}
