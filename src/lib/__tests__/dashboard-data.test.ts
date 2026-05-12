import { describe, it, expect } from "@jest/globals";
import { overviewData, publicStatusData } from "@/lib/dashboard-data";

describe("dashboard-data", () => {
  it("overviewData returns required fields", () => {
    const data = overviewData();
    expect(data).toHaveProperty("uptime");
    expect(data).toHaveProperty("p95");
    expect(data).toHaveProperty("errorRate");
    expect(data).toHaveProperty("deploysToday");
    expect(data).toHaveProperty("allEnvironments");
    expect(data).toHaveProperty("applications");
    expect(data.allEnvironments.length).toBeGreaterThan(0);
  });

  it("overviewData filters by env", () => {
    const all = overviewData();
    const filtered = overviewData("prod");
    expect(filtered.allEnvironments.length).toBeLessThanOrEqual(
      all.allEnvironments.length
    );
  });

  it("publicStatusData returns services", () => {
    const data = publicStatusData();
    expect(data).toHaveProperty("services");
    expect(data).toHaveProperty("overallStatus");
    expect(["ok", "warn", "down"]).toContain(data.overallStatus);
  });
});
