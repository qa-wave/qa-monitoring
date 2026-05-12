import { describe, it, expect, beforeEach } from "@jest/globals";

// We need to test the rate limit function
// Since it uses a module-level Map, we can test it directly

describe("rateLimit", () => {
  let rateLimit: typeof import("@/lib/rate-limit").rateLimit;

  beforeEach(async () => {
    // Re-import to reset the store
    jest.resetModules();
    const mod = await import("@/lib/rate-limit");
    rateLimit = mod.rateLimit;
  });

  it("allows requests within limit", () => {
    const result = rateLimit("test-ip", 5, 60000);
    expect(result.ok).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("blocks after limit exceeded", () => {
    for (let i = 0; i < 5; i++) {
      rateLimit("test-ip", 5, 60000);
    }
    const result = rateLimit("test-ip", 5, 60000);
    expect(result.ok).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("different keys are independent", () => {
    for (let i = 0; i < 5; i++) {
      rateLimit("ip-1", 5, 60000);
    }
    const result = rateLimit("ip-2", 5, 60000);
    expect(result.ok).toBe(true);
  });
});
