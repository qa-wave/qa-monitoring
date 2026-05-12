import type { AlertRule } from "@/lib/alerts";

export const defaultAlertRules: AlertRule[] = [
  {
    id: "default-latency",
    name: "Vysoká latence",
    metric: "latency",
    operator: "gt",
    threshold: 500,
    channel: "slack",
    enabled: true,
    createdAt: new Date().toISOString(),
    createdBy: "system",
  },
  {
    id: "default-uptime",
    name: "Nízký uptime",
    metric: "uptime",
    operator: "lt",
    threshold: 99.5,
    channel: "slack",
    enabled: true,
    createdAt: new Date().toISOString(),
    createdBy: "system",
  },
];
