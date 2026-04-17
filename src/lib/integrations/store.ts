import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { IntegrationConfig } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "integrations.json");

let cache: IntegrationConfig[] | null = null;

async function ensureFile(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(STORE_FILE);
  } catch {
    await fs.writeFile(STORE_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

async function readAll(): Promise<IntegrationConfig[]> {
  if (cache) return cache;
  await ensureFile();
  const raw = await fs.readFile(STORE_FILE, "utf-8");
  try {
    const parsed = JSON.parse(raw) as IntegrationConfig[];
    cache = parsed;
    return parsed;
  } catch {
    cache = [];
    return cache;
  }
}

async function writeAll(items: IntegrationConfig[]): Promise<void> {
  await ensureFile();
  cache = items;
  await fs.writeFile(STORE_FILE, JSON.stringify(items, null, 2), "utf-8");
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
