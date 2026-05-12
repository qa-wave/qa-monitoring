import {
  describe,
  it,
  expect,
  beforeEach,
} from "@jest/globals";
import {
  listIntegrations,
  createIntegration,
  getIntegration,
  deleteIntegration,
  invalidateCache,
} from "@/lib/integrations/store";

describe("integrations store", () => {
  beforeEach(() => {
    invalidateCache();
  });

  it("starts empty or with existing data", async () => {
    const items = await listIntegrations();
    expect(Array.isArray(items)).toBe(true);
  });

  it("creates and retrieves integration", async () => {
    const input = {
      providerKey: "test-provider",
      displayName: "Test",
      credentials: { token: "abc" },
      scope: {},
      enabled: true,
      createdBy: "test",
    };
    const created = await createIntegration(input);
    expect(created.id).toMatch(/^int-/);
    expect(created.providerKey).toBe("test-provider");

    const found = await getIntegration(created.id);
    expect(found?.displayName).toBe("Test");
  });

  it("deletes integration", async () => {
    const created = await createIntegration({
      providerKey: "del-test",
      displayName: "Delete Me",
      credentials: {},
      scope: {},
      enabled: true,
      createdBy: "test",
    });
    const deleted = await deleteIntegration(created.id);
    expect(deleted).toBe(true);

    const found = await getIntegration(created.id);
    expect(found).toBeUndefined();
  });
});
