import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { readJson, writeJson } from "@/lib/storage";
import { promises as fs } from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), ".data");
const TEST_KEY = "test-storage.json";
const TEST_FILE = path.join(DATA_DIR, TEST_KEY);

describe("storage (local fallback)", () => {
  beforeEach(async () => {
    // Ensure no BLOB token
    delete process.env.BLOB_READ_WRITE_TOKEN;
    try { await fs.unlink(TEST_FILE); } catch {}
  });

  afterEach(async () => {
    try { await fs.unlink(TEST_FILE); } catch {}
  });

  it("returns fallback when file doesn't exist", async () => {
    const result = await readJson(TEST_KEY, { default: true });
    expect(result).toEqual({ default: true });
  });

  it("writes and reads back data", async () => {
    await writeJson(TEST_KEY, { hello: "world" });
    const result = await readJson(TEST_KEY, null);
    expect(result).toEqual({ hello: "world" });
  });

  it("overwrites existing data", async () => {
    await writeJson(TEST_KEY, { v: 1 });
    await writeJson(TEST_KEY, { v: 2 });
    const result = await readJson(TEST_KEY, null);
    expect(result).toEqual({ v: 2 });
  });
});
