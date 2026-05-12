import { describe, it, expect } from "@jest/globals";
import { computeDoraMetrics } from "@/data/dora-metrics";

describe("computeDoraMetrics", () => {
  it("returns all four metrics", () => {
    const metrics = computeDoraMetrics();
    expect(metrics).toHaveProperty("deploymentFrequency");
    expect(metrics).toHaveProperty("leadTimeForChanges");
    expect(metrics).toHaveProperty("changeFailureRate");
    expect(metrics).toHaveProperty("timeToRestore");
  });

  it("each metric has value, unit and rating", () => {
    const metrics = computeDoraMetrics();
    for (const key of [
      "deploymentFrequency",
      "leadTimeForChanges",
      "changeFailureRate",
      "timeToRestore",
    ] as const) {
      expect(metrics[key]).toHaveProperty("value");
      expect(metrics[key]).toHaveProperty("unit");
      expect(metrics[key]).toHaveProperty("rating");
      expect(typeof metrics[key].value).toBe("number");
      expect(["elite", "high", "medium", "low"]).toContain(
        metrics[key].rating,
      );
    }
  });

  it("change failure rate is between 0 and 100", () => {
    const { changeFailureRate } = computeDoraMetrics();
    expect(changeFailureRate.value).toBeGreaterThanOrEqual(0);
    expect(changeFailureRate.value).toBeLessThanOrEqual(100);
  });

  it("deployment frequency is positive", () => {
    const { deploymentFrequency } = computeDoraMetrics();
    expect(deploymentFrequency.value).toBeGreaterThan(0);
  });
});
