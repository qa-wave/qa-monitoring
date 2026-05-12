export interface AlertRule {
  id: string;
  name: string;
  metric: "latency" | "errorRate" | "uptime" | "deployFailRate" | "flakyTests";
  operator: "gt" | "lt" | "eq";
  threshold: number;
  channel: "email" | "slack" | "both";
  enabled: boolean;
  createdAt: string;
  createdBy: string;
}

export const METRIC_LABELS: Record<AlertRule["metric"], string> = {
  latency: "p95 latence (ms)",
  errorRate: "Error rate (%)",
  uptime: "Uptime (%)",
  deployFailRate: "Deploy failure rate (%)",
  flakyTests: "Flaky test count",
};

export const OPERATOR_LABELS: Record<AlertRule["operator"], string> = {
  gt: ">",
  lt: "<",
  eq: "=",
};
