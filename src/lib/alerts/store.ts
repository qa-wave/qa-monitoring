import { randomUUID } from "node:crypto";
import { readJson, writeJson } from "@/lib/storage";
import type { AlertRule } from "@/lib/alerts";
import { defaultAlertRules } from "@/data/alert-rules";

const STORE_KEY = "alert-rules.json";

let cache: AlertRule[] | null = null;

async function readAll(): Promise<AlertRule[]> {
  if (cache) return cache;
  const items = await readJson<AlertRule[]>(STORE_KEY, []);
  if (items.length > 0) {
    cache = items;
    return items;
  }
  await writeJson(STORE_KEY, defaultAlertRules);
  cache = defaultAlertRules;
  return defaultAlertRules;
}

async function writeAll(items: AlertRule[]): Promise<void> {
  cache = items;
  await writeJson(STORE_KEY, items);
}

export async function listAlertRules(): Promise<AlertRule[]> {
  return readAll();
}

export async function getAlertRule(id: string): Promise<AlertRule | undefined> {
  const all = await readAll();
  return all.find((r) => r.id === id);
}

export async function createAlertRule(
  input: Omit<AlertRule, "id" | "createdAt">,
): Promise<AlertRule> {
  const all = await readAll();
  const created: AlertRule = {
    ...input,
    id: `alert-${randomUUID().slice(0, 8)}`,
    createdAt: new Date().toISOString(),
  };
  await writeAll([...all, created]);
  return created;
}

export async function updateAlertRule(
  id: string,
  patch: Partial<AlertRule>,
): Promise<AlertRule | undefined> {
  const all = await readAll();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return undefined;
  const merged: AlertRule = { ...all[idx], ...patch, id: all[idx].id };
  const next = [...all];
  next[idx] = merged;
  await writeAll(next);
  return merged;
}

export async function deleteAlertRule(id: string): Promise<boolean> {
  const all = await readAll();
  const next = all.filter((r) => r.id !== id);
  if (next.length === all.length) return false;
  await writeAll(next);
  return true;
}

export function invalidateCache(): void {
  cache = null;
}
