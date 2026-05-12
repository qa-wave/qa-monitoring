import { promises as fs } from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), ".data");

function isVercel(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

export async function readJson<T>(key: string, fallback: T): Promise<T> {
  if (isVercel()) {
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
  if (isVercel()) {
    const { put } = await import("@vercel/blob");
    await put(key, JSON.stringify(data, null, 2), { access: "public", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json" });
    return;
  }
  const filePath = path.join(DATA_DIR, key);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}
