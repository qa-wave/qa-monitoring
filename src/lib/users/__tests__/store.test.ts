/**
 * @jest-environment node
 */
import { promises as fs } from "node:fs";
import path from "node:path";

// Izolované testy: každému testu vytvoříme čerstvý .data/users.json
// skrze cwd override + cache reset.
const testRoot = path.join(process.cwd(), "test-tmp-users");

async function freshStore() {
  try {
    await fs.rm(testRoot, { recursive: true, force: true });
  } catch {}
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

describe("users/store", () => {
  it("seed: první čtení vytvoří .data/users.json z fixtur s bcrypt hashem pro 'demo'", async () => {
    const { mod, cleanup } = await freshStore();
    try {
      const users = await mod.listUsers();
      expect(users.length).toBeGreaterThanOrEqual(6);
      const admin = users.find((u) => u.email === "admin@example.com");
      expect(admin).toBeDefined();
      // Hash začíná na $2a$/$2b$/$2y$
      expect(admin!.passwordHash).toMatch(/^\$2[aby]\$/);
      // Ověř, že 'demo' je platné heslo, jiné nikoli
      expect(await mod.verifyPassword(admin!, "demo")).toBe(true);
      expect(await mod.verifyPassword(admin!, "wrong")).toBe(false);
    } finally {
      await cleanup();
    }
  });

  it("verifyPassword: vrátí false, když uživatel nemá hash", async () => {
    const { mod, cleanup } = await freshStore();
    try {
      const fakeUser = { id: "x", email: "x@x", name: "x", role: "viewer" as const, personaPreference: "dev" as const };
      expect(await mod.verifyPassword(fakeUser, "anything")).toBe(false);
    } finally {
      await cleanup();
    }
  });

  it("createUser: odmítne duplicitní e-mail", async () => {
    const { mod, cleanup } = await freshStore();
    try {
      await mod.createUser({
        email: "test@example.com",
        name: "Test",
        role: "viewer",
        personaPreference: "dev",
        password: "test123",
      });
      await expect(
        mod.createUser({
          email: "test@example.com",
          name: "Duplicate",
          role: "viewer",
          personaPreference: "dev",
          password: "test123",
        })
      ).rejects.toThrow(/existuje/);
    } finally {
      await cleanup();
    }
  });

  it("createUser: odmítne krátké heslo (<6 znaků)", async () => {
    const { mod, cleanup } = await freshStore();
    try {
      await expect(
        mod.createUser({
          email: "x@example.com",
          name: "X",
          role: "viewer",
          personaPreference: "dev",
          password: "abc",
        })
      ).rejects.toThrow(/6 znaků/);
    } finally {
      await cleanup();
    }
  });

  it("createUser: nové heslo se uloží jako bcrypt hash a verifikuje", async () => {
    const { mod, cleanup } = await freshStore();
    try {
      const created = await mod.createUser({
        email: "new@example.com",
        name: "N",
        role: "viewer",
        personaPreference: "dev",
        password: "supersecret",
      });
      expect(created.passwordHash).toMatch(/^\$2[aby]\$/);
      expect(await mod.verifyPassword(created, "supersecret")).toBe(true);
      expect(await mod.verifyPassword(created, "supersecre")).toBe(false);
    } finally {
      await cleanup();
    }
  });

  it("updateUser: admin nemůže degradovat sám sebe", async () => {
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

  it("updateUser: posledního admina nelze degradovat (i jiným adminem)", async () => {
    const { mod, cleanup } = await freshStore();
    try {
      const admins = (await mod.listUsers()).filter((u) => u.role === "admin");
      const [keeper, ...others] = admins;
      for (const a of others) {
        await mod.updateUser(a.id, { role: "viewer" }, keeper.id);
      }
      const viewer = (await mod.listUsers()).find((u) => u.role === "viewer")!;
      await expect(
        mod.updateUser(keeper.id, { role: "viewer" }, viewer.id)
      ).rejects.toThrow(/posledn/);
    } finally {
      await cleanup();
    }
  });

  it("updateUser: password patch rehashuje", async () => {
    const { mod, cleanup } = await freshStore();
    try {
      const u = (await mod.findUserByEmail("viewer@example.com"))!;
      const oldHash = u.passwordHash;
      const updated = await mod.updateUser(u.id, { password: "novehes" }, "u-2");
      expect(updated.passwordHash).not.toBe(oldHash);
      expect(await mod.verifyPassword(updated, "novehes")).toBe(true);
      expect(await mod.verifyPassword(updated, "demo")).toBe(false);
    } finally {
      await cleanup();
    }
  });

  it("deleteUser: nelze smazat sám sebe", async () => {
    const { mod, cleanup } = await freshStore();
    try {
      const u = (await mod.findUserByEmail("admin@example.com"))!;
      await expect(mod.deleteUser(u.id, u.id)).rejects.toThrow(/sebe/i);
    } finally {
      await cleanup();
    }
  });

  it("deleteUser: nelze smazat posledního admina", async () => {
    const { mod, cleanup } = await freshStore();
    try {
      const admins = (await mod.listUsers()).filter((u) => u.role === "admin");
      const [keeper, ...others] = admins;
      const viewer = (await mod.listUsers()).find((u) => u.role === "viewer")!;
      for (const a of others) {
        await mod.deleteUser(a.id, keeper.id);
      }
      await expect(mod.deleteUser(keeper.id, viewer.id)).rejects.toThrow(/posledn/);
    } finally {
      await cleanup();
    }
  });

  it("listPublicUsers + toPublicUser: passwordHash neuteče na klienta", async () => {
    const { mod, cleanup } = await freshStore();
    try {
      const publicUsers = await mod.listPublicUsers();
      for (const u of publicUsers) {
        expect(u).not.toHaveProperty("passwordHash");
      }
    } finally {
      await cleanup();
    }
  });
});
