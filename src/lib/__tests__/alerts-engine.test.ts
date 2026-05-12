import { describe, it, expect } from "@jest/globals";
import { evaluateAlerts } from "@/lib/alerts-engine";
import type { AlertRule } from "@/lib/alerts";

const makeRule = (overrides: Partial<AlertRule> = {}): AlertRule => ({
  id: "test",
  name: "Test alert",
  metric: "latency",
  operator: "gt",
  threshold: 500,
  channel: "slack",
  enabled: true,
  createdAt: new Date().toISOString(),
  createdBy: "test",
  ...overrides,
});

describe("evaluateAlerts", () => {
  const metrics = { latency: 600, errorRate: 0.5, uptime: 99.8, deployFailRate: 10, flakyTests: 5 };

  it("triggers when value exceeds threshold", () => {
    const rules = [makeRule({ metric: "latency", operator: "gt", threshold: 500 })];
    const triggered = evaluateAlerts(rules, metrics);
    expect(triggered).toHaveLength(1);
  });

  it("does not trigger when value is below threshold", () => {
    const rules = [makeRule({ metric: "latency", operator: "gt", threshold: 700 })];
    const triggered = evaluateAlerts(rules, metrics);
    expect(triggered).toHaveLength(0);
  });

  it("respects lt operator", () => {
    const rules = [makeRule({ metric: "uptime", operator: "lt", threshold: 99.9 })];
    const triggered = evaluateAlerts(rules, metrics);
    expect(triggered).toHaveLength(1);
  });

  it("skips disabled rules", () => {
    const rules = [makeRule({ enabled: false })];
    const triggered = evaluateAlerts(rules, metrics);
    expect(triggered).toHaveLength(0);
  });

  it("evaluates multiple rules", () => {
    const rules = [
      makeRule({ id: "1", metric: "latency", operator: "gt", threshold: 500 }),
      makeRule({ id: "2", metric: "uptime", operator: "lt", threshold: 99.9 }),
      makeRule({ id: "3", metric: "errorRate", operator: "gt", threshold: 1 }), // won't trigger
    ];
    const triggered = evaluateAlerts(rules, metrics);
    expect(triggered).toHaveLength(2);
  });
});
