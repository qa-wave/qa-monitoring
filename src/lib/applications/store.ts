import { randomUUID } from "node:crypto";
import { readJson, writeJson } from "@/lib/storage";
import { applications as seedApps } from "@/data/applications";
import type { Application } from "@/lib/types";

const STORE_KEY = "applications.json";

let cache: Application[] | null = null;

async function readAll(): Promise<Application[]> {
  if (cache) return cache;
  const items = await readJson<Application[]>(STORE_KEY, []);
  if (items.length > 0) {
    cache = items;
    return items;
  }
  // Seed from fixtures
  await writeJson(STORE_KEY, seedApps);
  cache = seedApps;
  return seedApps;
}

async function writeAll(items: Application[]): Promise<void> {
  cache = items;
  await writeJson(STORE_KEY, items);
}

export async function listApplications(): Promise<Application[]> {
  return readAll();
}

export async function getApplication(id: string): Promise<Application | undefined> {
  const all = await readAll();
  return all.find((a) => a.id === id);
}

export async function createApplication(
  input: Omit<Application, "id">,
): Promise<Application> {
  const all = await readAll();
  if (all.some((a) => a.slug === input.slug)) {
    throw new ApplicationStoreError("slug_exists", "Aplikace s tímto slugem už existuje.");
  }
  const created: Application = {
    ...input,
    id: `app-${randomUUID().slice(0, 8)}`,
  };
  await writeAll([...all, created]);
  return created;
}

export async function updateApplication(
  id: string,
  patch: Partial<Omit<Application, "id">>,
): Promise<Application | undefined> {
  const all = await readAll();
  const idx = all.findIndex((a) => a.id === id);
  if (idx === -1) return undefined;
  if (patch.slug && patch.slug !== all[idx].slug) {
    if (all.some((a) => a.slug === patch.slug)) {
      throw new ApplicationStoreError("slug_exists", "Aplikace s tímto slugem už existuje.");
    }
  }
  const merged: Application = { ...all[idx], ...patch, id: all[idx].id };
  const next = [...all];
  next[idx] = merged;
  await writeAll(next);
  return merged;
}

export async function deleteApplication(id: string): Promise<boolean> {
  const all = await readAll();
  const next = all.filter((a) => a.id !== id);
  if (next.length === all.length) return false;
  await writeAll(next);
  return true;
}

export function invalidateCache(): void {
  cache = null;
}

export class ApplicationStoreError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApplicationStoreError";
  }
}
