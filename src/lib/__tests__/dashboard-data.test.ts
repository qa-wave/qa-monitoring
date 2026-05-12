import { describe, it, expect } from "@jest/globals";
import { overviewData, publicStatusData } from "@/lib/dashboard-data";

describe("dashboard-data", () => {
  it("overviewData returns required fields", async () => {
    const data = await overviewData();
    expect(data).toHaveProperty("uptime");
    expect(data).toHaveProperty("p95");
    expect(data).toHaveProperty("errorRate");
    expect(data).toHaveProperty("deploysToday");
    expect(data).toHaveProperty("allEnvironments");
    expect(data).toHaveProperty("applications");
    expect(data.allEnvironments.length).toBeGreaterThan(0);
  });

  it("overviewData filters by env", async () => {
    const all = await overviewData();
    const filtered = await overviewData("prod");
    expect(filtered.allEnvironments.length).toBeLessThanOrEqual(
      all.allEnvironments.length
    );
  });

  it("publicStatusData returns services", async () => {
    const data = await publicStatusData();
    expect(data).toHaveProperty("services");
    expect(data).toHaveProperty("overallStatus");
    expect(["ok", "warn", "down"]).toContain(data.overallStatus);
  });
});
