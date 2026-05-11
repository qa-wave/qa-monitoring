import { randomUUID } from "node:crypto";
import { readJson, writeJson } from "@/lib/storage";
import type { IntegrationConfig } from "@/lib/types";

const STORE_KEY = "integrations.json";

let cache: IntegrationConfig[] | null = null;

async function readAll(): Promise<IntegrationConfig[]> {
  if (cache) return cache;
  const data = await readJson<IntegrationConfig[]>(STORE_KEY, []);
  cache = data;
  return data;
}

async function writeAll(items: IntegrationConfig[]): Promise<void> {
  cache = items;
  await writeJson(STORE_KEY, items);
}

export async function listIntegrations(): Promise<IntegrationConfig[]> {
  return readAll();
}

export async function getIntegration(id: string): Promise<IntegrationConfig | undefined> {
  const all = await readAll();
  return all.find((i) => i.id === id);
}

export async function createIntegration(
  input: Omit<IntegrationConfig, "id" | "createdAt" | "lastTestedAt" | "lastTestResult">
): Promise<IntegrationConfig> {
  const all = await readAll();
  const created: IntegrationConfig = {
    ...input,
    id: `int-${randomUUID().slice(0, 8)}`,
    createdAt: new Date().toISOString(),
    lastTestedAt: null,
    lastTestResult: null,
  };
  await writeAll([...all, created]);
  return created;
}

export async function updateIntegration(
  id: string,
  patch: Partial<IntegrationConfig>
): Promise<IntegrationConfig | undefined> {
  const all = await readAll();
  const idx = all.findIndex((i) => i.id === id);
  if (idx === -1) return undefined;
  const merged: IntegrationConfig = { ...all[idx], ...patch, id: all[idx].id };
  const next = [...all];
  next[idx] = merged;
  await writeAll(next);
  return merged;
}

export async function deleteIntegration(id: string): Promise<boolean> {
  const all = await readAll();
  const next = all.filter((i) => i.id !== id);
  if (next.length === all.length) return false;
  await writeAll(next);
  return true;
}

export function invalidateCache(): void {
  cache = null;
}
