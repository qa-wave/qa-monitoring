/**
 * @jest-environment node
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Deployment } from "@/lib/types";

const testRoot = path.join(process.cwd(), "test-tmp-ingest");

async function freshStore() {
  delete process.env.DATABASE_URL;
  delete process.env.BLOB_READ_WRITE_TOKEN;
  await fs.rm(testRoot, { recursive: true, force: true });
  await fs.mkdir(testRoot, { recursive: true });

  const originalCwd = process.cwd();
  process.chdir(testRoot);
  jest.resetModules();
  const mod = await import("../store");

  return {
    mod,
    cleanup: async () => {
      process.chdir(originalCwd);
      await fs.rm(testRoot, { recursive: true, force: true });
    },
  };
}

function deployment(id: string, version: string): Deployment {
  return {
    id,
    appId: "app-api",
    envId: "env-prod",
    version,
    commitSha: "abc123",
    commitMessage: "Deploy",
    status: "success",
    startedAt: "2026-05-17T10:00:00.000Z",
    finishedAt: "2026-05-17T10:01:00.000Z",
    actor: "test",
    durationSec: 60,
  };
}

describe("ingest/store", () => {
  it("upserts ingested items by id and keeps newest run first", async () => {
    const { mod, cleanup } = await freshStore();
    try {
      await mod.upsertIngestedData(
        { deployments: [deployment("int-1:deploy-1", "v1")] },
        {
          id: "run-1",
          integrationId: "int-1",
          providerKey: "github",
          status: "success",
          startedAt: "2026-05-17T10:00:00.000Z",
          finishedAt: "2026-05-17T10:01:00.000Z",
          counts: { deployments: 1 },
        },
      );

      const data = await mod.upsertIngestedData(
        { deployments: [deployment("int-1:deploy-1", "v2")] },
        {
          id: "run-2",
          integrationId: "int-1",
          providerKey: "github",
          status: "success",
          startedAt: "2026-05-17T11:00:00.000Z",
          finishedAt: "2026-05-17T11:01:00.000Z",
          counts: { deployments: 1 },
        },
      );

      expect(data.deployments).toHaveLength(1);
      expect(data.deployments[0].version).toBe("v2");
      expect(data.runs.map((run) => run.id)).toEqual(["run-2", "run-1"]);
      expect(data.updatedAt).toBe("2026-05-17T11:01:00.000Z");
    } finally {
      await cleanup();
    }
  });
});
