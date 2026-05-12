import { randomUUID } from "node:crypto";
import { readJson, writeJson } from "@/lib/storage";
import { auditLog as seedLog } from "@/data/audit-log";
import type { AuditEntry } from "@/lib/types";

const STORE_KEY = "audit-log.json";

export async function listAuditEntries(limit = 50): Promise<AuditEntry[]> {
  const items = await readJson<AuditEntry[]>(STORE_KEY, []);
  if (items.length > 0) return items.slice(0, limit);
  await writeJson(STORE_KEY, seedLog);
  return seedLog.slice(0, limit);
}

export async function addAuditEntry(
  entry: Omit<AuditEntry, "id" | "at">,
): Promise<AuditEntry> {
  const all = await readJson<AuditEntry[]>(STORE_KEY, []);
  const created: AuditEntry = {
    ...entry,
    id: `audit-${randomUUID().slice(0, 8)}`,
    at: new Date().toISOString(),
  };
  await writeJson(STORE_KEY, [created, ...all].slice(0, 200));
  return created;
}
