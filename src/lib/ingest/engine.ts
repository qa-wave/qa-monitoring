import { randomUUID } from "node:crypto";
import { getProviderDefinition } from "@/lib/integrations/registry";
import { getIntegration, listIntegrations, updateIntegration } from "@/lib/integrations/store";
import { logger } from "@/lib/logger";
import type {
  Deployment,
  ErrorSummary,
  FeatureFlag,
  HealthCheck,
  Incident,
  PipelineRun,
  TestRun,
  IntegrationConfig,
} from "@/lib/types";
import type { ProviderCapability, ProviderScope } from "@/lib/integrations/types";
import {
  type IngestPayload,
  type IngestRun,
  upsertIngestedData,
} from "./store";

type PayloadKey = keyof IngestPayload;

type FetcherConfig<T> = {
  capability: keyof ProviderCapability;
  key: PayloadKey;
  normalize: (items: T[], integration: IntegrationConfig) => T[];
};

export interface SyncIntegrationResult {
  run: IngestRun;
  payload: IngestPayload;
}

function firstOrEmpty(items: string[] | undefined): string {
  return items?.[0] ?? "";
}

function sourceId(integrationId: string, id: string): string {
  return id.startsWith(`${integrationId}:`) ? id : `${integrationId}:${id}`;
}

function withAppEnv<T extends { id: string; appId: string; envId: string }>(
  items: T[],
  integration: IntegrationConfig,
): T[] {
  const appId = firstOrEmpty(integration.scope.appIds);
  const envId = firstOrEmpty(integration.scope.envIds);
  return items.map((item) => ({
    ...item,
    id: sourceId(integration.id, item.id),
    appId: item.appId || appId,
    envId: item.envId || envId,
  }));
}

function withSourceId<T extends { id: string }>(
  items: T[],
  integration: IntegrationConfig,
): T[] {
  return items.map((item) => ({
    ...item,
    id: sourceId(integration.id, item.id),
  }));
}

function withAffectedScope(
  items: Incident[],
  integration: IntegrationConfig,
): Incident[] {
  return items.map((item) => ({
    ...item,
    id: sourceId(integration.id, item.id),
    affectedAppIds:
      item.affectedAppIds.length > 0
        ? item.affectedAppIds
        : integration.scope.appIds ?? [],
    affectedEnvIds:
      item.affectedEnvIds.length > 0
        ? item.affectedEnvIds
        : integration.scope.envIds ?? [],
  }));
}

const FETCHERS: FetcherConfig<unknown>[] = [
  {
    capability: "fetchDeployments",
    key: "deployments",
    normalize: (items, integration) =>
      withAppEnv(items as Deployment[], integration),
  },
  {
    capability: "fetchHealth",
    key: "healthChecks",
    normalize: (items, integration) =>
      withAppEnv(items as HealthCheck[], integration),
  },
  {
    capability: "fetchErrors",
    key: "errorSummaries",
    normalize: (items, integration) =>
      withAppEnv(items as ErrorSummary[], integration),
  },
  {
    capability: "fetchPipelineRuns",
    key: "pipelineRuns",
    normalize: (items, integration) =>
      withAppEnv(items as PipelineRun[], integration),
  },
  {
    capability: "fetchFlags",
    key: "featureFlags",
    normalize: (items, integration) =>
      withSourceId(items as FeatureFlag[], integration),
  },
  {
    capability: "fetchTestRuns",
    key: "testRuns",
    normalize: (items, integration) =>
      withAppEnv(items as TestRun[], integration),
  },
  {
    capability: "fetchIncidents",
    key: "incidents",
    normalize: (items, integration) =>
      withAffectedScope(items as Incident[], integration),
  },
];

function buildScope(integration: IntegrationConfig): ProviderScope {
  return {
    appId: firstOrEmpty(integration.scope.appIds) || undefined,
    envId: firstOrEmpty(integration.scope.envIds) || undefined,
    limit: 50,
  };
}

export async function syncIntegration(
  integrationId: string,
): Promise<SyncIntegrationResult> {
  const startedAt = new Date().toISOString();
  const integration = await getIntegration(integrationId);
  if (!integration) {
    throw new Error(`Integrace ${integrationId} neexistuje.`);
  }

  const def = getProviderDefinition(integration.providerKey);
  if (!def) {
    throw new Error(`Neznámý provider: ${integration.providerKey}`);
  }

  const counts: Record<string, number> = {};
  const errors: string[] = [];
  const payload: IngestPayload = {};

  if (!integration.enabled) {
    const finishedAt = new Date().toISOString();
    const run: IngestRun = {
      id: `ingest-${randomUUID().slice(0, 8)}`,
      integrationId: integration.id,
      providerKey: integration.providerKey,
      status: "skipped",
      startedAt,
      finishedAt,
      counts,
      message: "Integrace je vypnutá.",
    };
    await upsertIngestedData(payload, run);
    return { run, payload };
  }

  const adapter = def.create(integration.credentials as never);
  const scope = buildScope(integration);

  for (const fetcher of FETCHERS) {
    const fn = adapter[fetcher.capability];
    if (typeof fn !== "function") continue;
    try {
      const items = await (fn as (scope: ProviderScope) => Promise<unknown[]>)(scope);
      const normalized = fetcher.normalize(items, integration);
      payload[fetcher.key] = normalized as never;
      counts[fetcher.key] = normalized.length;
    } catch (err) {
      const message = `${String(fetcher.capability)}: ${(err as Error).message}`;
      errors.push(message);
      logger.warn("integration.ingest.capability_failed", {
        integrationId: integration.id,
        providerKey: integration.providerKey,
        capability: fetcher.capability,
        error: message,
      });
    }
  }

  const finishedAt = new Date().toISOString();
  const status =
    errors.length === 0 ? "success" : Object.keys(counts).length > 0 ? "partial" : "error";
  const run: IngestRun = {
    id: `ingest-${randomUUID().slice(0, 8)}`,
    integrationId: integration.id,
    providerKey: integration.providerKey,
    status,
    startedAt,
    finishedAt,
    counts,
    message: errors.join("; ") || undefined,
  };

  await upsertIngestedData(payload, run);
  await updateIntegration(integration.id, {
    lastTestedAt: finishedAt,
    lastTestResult: status === "error" ? "error" : "ok",
    lastTestMessage:
      status === "success"
        ? `Synchronizováno: ${Object.values(counts).reduce((a, b) => a + b, 0)} položek.`
        : run.message,
  });

  return { run, payload };
}

export async function syncEnabledIntegrations(): Promise<SyncIntegrationResult[]> {
  const integrations = await listIntegrations();
  const enabled = integrations.filter((integration) => integration.enabled);
  const results: SyncIntegrationResult[] = [];
  for (const integration of enabled) {
    results.push(await syncIntegration(integration.id));
  }
  return results;
}
