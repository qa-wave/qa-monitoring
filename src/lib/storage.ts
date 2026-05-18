import { promises as fs } from "node:fs";
import path from "node:path";
import { logger } from "./logger";

const DATA_DIR = path.join(process.cwd(), ".data");

let storageTableReady = false;

function shouldUsePostgres(): boolean {
  return !!process.env.DATABASE_URL && process.env.STORAGE_BACKEND !== "blob";
}

function shouldUseBlob(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

async function ensureStorageTable(): Promise<void> {
  if (storageTableReady) return;
  const { getDb } = await import("./db");
  const db = getDb();
  if (!db) return;
  await db`
    CREATE TABLE IF NOT EXISTS app_storage (
      key TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  storageTableReady = true;
}

async function readPostgresJson<T>(key: string, fallback: T): Promise<T> {
  const { getDb } = await import("./db");
  const db = getDb();
  if (!db) return fallback;
  await ensureStorageTable();
  const rows = (await db`
    SELECT data
    FROM app_storage
    WHERE key = ${key}
    LIMIT 1
  `) as Array<{ data: T }>;
  return rows[0]?.data ?? fallback;
}

async function writePostgresJson<T>(key: string, data: T): Promise<void> {
  const { getDb } = await import("./db");
  const db = getDb();
  if (!db) return;
  await ensureStorageTable();
  await db`
    INSERT INTO app_storage (key, data, updated_at)
    VALUES (${key}, ${JSON.stringify(data)}::jsonb, NOW())
    ON CONFLICT (key)
    DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
  `;
}

export async function readJson<T>(key: string, fallback: T): Promise<T> {
  if (shouldUsePostgres()) {
    try {
      return await readPostgresJson(key, fallback);
    } catch (err) {
      logger.warn("storage.postgres_read_failed", { key, error: String(err) });
    }
  }

  if (shouldUseBlob()) {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: key, limit: 1 });
    const blob = blobs.find((b) => b.pathname === key);
    if (!blob) return fallback;
    const res = await fetch(blob.url);
    if (!res.ok) return fallback;
    try { return (await res.json()) as T; } catch { return fallback; }
  }
  const filePath = path.join(DATA_DIR, key);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch { return fallback; }
}

export async function writeJson<T>(key: string, data: T): Promise<void> {
  if (shouldUsePostgres()) {
    try {
      await writePostgresJson(key, data);
      return;
    } catch (err) {
      logger.warn("storage.postgres_write_failed", { key, error: String(err) });
    }
  }

  if (shouldUseBlob()) {
    const { put } = await import("@vercel/blob");
    const payload = JSON.stringify(data, null, 2);
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await put(key, payload, {
          access: "public",
          addRandomSuffix: false,
          allowOverwrite: true,
          contentType: "application/json",
        });
        return;
      } catch (err) {
        logger.warn("storage.blob_write_retry", { key, attempt, error: String(err) });
        if (attempt === 2) throw err;
        await new Promise((r) => setTimeout(r, 100 * (attempt + 1)));
      }
    }
    return;
  }
  const filePath = path.join(DATA_DIR, key);
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmpPath = `${filePath}.${Date.now()}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), "utf-8");
  await fs.rename(tmpPath, filePath);
}
