import { randomUUID } from "node:crypto";
import { readJson, writeJson } from "@/lib/storage";
import { environments as seedEnvs } from "@/data/environments";
import type { Environment } from "@/lib/types";

const STORE_KEY = "environments.json";

let cache: Environment[] | null = null;

async function readAll(): Promise<Environment[]> {
  if (cache) return cache;
  const items = await readJson<Environment[]>(STORE_KEY, []);
  if (items.length > 0) {
    cache = items;
    return items;
  }
  // Seed from fixtures
  await writeJson(STORE_KEY, seedEnvs);
  cache = seedEnvs;
  return seedEnvs;
}

async function writeAll(items: Environment[]): Promise<void> {
  cache = items;
  await writeJson(STORE_KEY, items);
}

export async function listEnvironments(): Promise<Environment[]> {
  return readAll();
}

export async function getEnvironment(id: string): Promise<Environment | undefined> {
  const all = await readAll();
  return all.find((e) => e.id === id);
}

export async function createEnvironment(
  input: Omit<Environment, "id">,
): Promise<Environment> {
  const all = await readAll();
  if (all.some((e) => e.slug === input.slug)) {
    throw new EnvironmentStoreError("slug_exists", "Prostředí s tímto slugem už existuje.");
  }
  const created: Environment = {
    ...input,
    id: `env-${randomUUID().slice(0, 8)}`,
  };
  await writeAll([...all, created]);
  return created;
}

export async function updateEnvironment(
  id: string,
  patch: Partial<Omit<Environment, "id">>,
): Promise<Environment | undefined> {
  const all = await readAll();
  const idx = all.findIndex((e) => e.id === id);
  if (idx === -1) return undefined;
  if (patch.slug && patch.slug !== all[idx].slug) {
    if (all.some((e) => e.slug === patch.slug)) {
      throw new EnvironmentStoreError("slug_exists", "Prostředí s tímto slugem už existuje.");
    }
  }
  const merged: Environment = { ...all[idx], ...patch, id: all[idx].id };
  const next = [...all];
  next[idx] = merged;
  await writeAll(next);
  return merged;
}

export async function deleteEnvironment(id: string): Promise<boolean> {
  const all = await readAll();
  const next = all.filter((e) => e.id !== id);
  if (next.length === all.length) return false;
  await writeAll(next);
  return true;
}

export function invalidateCache(): void {
  cache = null;
}

export class EnvironmentStoreError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "EnvironmentStoreError";
  }
}
