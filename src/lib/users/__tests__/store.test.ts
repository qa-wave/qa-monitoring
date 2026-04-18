/**
 * @jest-environment node
 */
import { promises as fs } from "node:fs";
import path from "node:path";

// Izolované testy: každému testu vytvoříme čerstvý .data/users.json
// skrze cwd override + cache reset.
const testRoot = path.join(process.cwd(), "test-tmp-users");

async function freshStore() {
  // Smaž starý test-tmp
  try {
    await fs.rm(testRoot, { recursive: true, force: true });
  } catch {}
  await fs.mkdir(testRoot, { recursive: true });

  const originalCwd = process.cwd();
  process.chdir(testRoot);

  // Reset module cache, aby store.ts znovu načetl cache a otevřel nový file.
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

describe("users/store", () => {
  it("seed: prvn\u00ed \u010dten\u00ed vytvo\u0159\u00ed .data/users.json z fixtur", async () => {
    const { mod, cleanup } = await freshStore();
    try {
      const users = await mod.listUsers();
      expect(users.length).toBeGreaterThanOrEqual(6);
      expect(users.some((u) => u.email === "admin@example.com")).toBe(true);
      // Soubor existuje
      await fs.access(path.join(process.cwd(), ".data", "users.json"));
    } finally {
      await cleanup();
    }
  });

  it("createUser: odm\u00edtne duplicitn\u00ed e-mail", async () => {
    const { mod, cleanup } = await freshStore();
    try {
      await mod.createUser({
        email: "test@example.com",
        name: "Test",
        role: "viewer",
        personaPreference: "dev",
      });
      await expect(
        mod.createUser({
          email: "test@example.com",
          name: "Duplicate",
          role: "viewer",
          personaPreference: "dev",
        })
      ).rejects.toThrow(/existuje/);
    } finally {
      await cleanup();
    }
  });

  it("updateUser: admin nem\u016f\u017ee degradovat s\u00e1m sebe", async () => {
    const { mod, cleanup } = await freshStore();
    try {
      const u = (await mod.findUserByEmail("admin@example.com"))!;
      await expect(
        mod.updateUser(u.id, { role: "viewer" }, u.id)
      ).rejects.toThrow(/sam/i);
    } finally {
      await cleanup();
    }
  });

  it("updateUser: posledn\u00edho admina nelze degradovat (i jin\u00fdm adminem)", async () => {
    const { mod, cleanup } = await freshStore();
    try {
      // Degraduj v\u0161echny adminy krom\u011b jednoho
      const admins = (await mod.listUsers()).filter((u) => u.role === "admin");
      const [keeper, ...others] = admins;
      for (const a of others) {
        // pou\u017eij keepera jako actora, aby nebyl self-demote
        await mod.updateUser(a.id, { role: "viewer" }, keeper.id);
      }
      // Te\u010f z\u016fstal jen keeper jako admin. Pokus\u00edme se ho degradovat jin\u00fdm userem.
      const viewer = (await mod.listUsers()).find((u) => u.role === "viewer")!;
      await expect(
        mod.updateUser(keeper.id, { role: "viewer" }, viewer.id)
      ).rejects.toThrow(/posledn\u00edmu/);
    } finally {
      await cleanup();
    }
  });

  it("deleteUser: nelze smazat s\u00e1m sebe", async () => {
    const { mod, cleanup } = await freshStore();
    try {
      const u = (await mod.findUserByEmail("admin@example.com"))!;
      await expect(mod.deleteUser(u.id, u.id)).rejects.toThrow(/sebe/i);
    } finally {
      await cleanup();
    }
  });

  it("deleteUser: nelze smazat posledn\u00edho admina", async () => {
    const { mod, cleanup } = await freshStore();
    try {
      const admins = (await mod.listUsers()).filter((u) => u.role === "admin");
      const [keeper, ...others] = admins;
      const viewer = (await mod.listUsers()).find((u) => u.role === "viewer")!;
      for (const a of others) {
        await mod.deleteUser(a.id, keeper.id);
      }
      await expect(mod.deleteUser(keeper.id, viewer.id)).rejects.toThrow(/posledn\u00edho/);
    } finally {
      await cleanup();
    }
  });

  it("updateUser + deleteUser se persistuj\u00ed do souboru", async () => {
    const { mod, cleanup } = await freshStore();
    try {
      const created = await mod.createUser({
        email: "new@example.com",
        name: "N",
        role: "viewer",
        personaPreference: "dev",
      });
      await mod.updateUser(created.id, { role: "admin" }, "u-2");
      mod.invalidateCache();
      const reloaded = (await mod.findUserById(created.id))!;
      expect(reloaded.role).toBe("admin");

      // Smaz\u00e1n\u00ed
      await mod.deleteUser(created.id, "u-2");
      mod.invalidateCache();
      expect(await mod.findUserById(created.id)).toBeUndefined();
    } finally {
      await cleanup();
    }
  });
});
