import type { AlertRule } from "./alerts";
import { sendSlackNotification } from "./notifications/slack";

export interface MetricValues {
  latency: number;
  errorRate: number;
  uptime: number;
  deployFailRate: number;
  flakyTests: number;
}

export function evaluateAlerts(rules: AlertRule[], metrics: MetricValues): AlertRule[] {
  const triggered: AlertRule[] = [];
  for (const rule of rules) {
    if (!rule.enabled) continue;
    const value = metrics[rule.metric];
    const isTriggered =
      rule.operator === "gt" ? value > rule.threshold :
      rule.operator === "lt" ? value < rule.threshold :
      Math.abs(value - rule.threshold) < 0.01;
    if (isTriggered) triggered.push(rule);
  }
  return triggered;
}

export async function processAlerts(rules: AlertRule[], metrics: MetricValues): Promise<void> {
  const triggered = evaluateAlerts(rules, metrics);
  for (const rule of triggered) {
    const message = `⚠️ Alert: ${rule.name} — ${rule.metric} ${rule.operator === "gt" ? ">" : rule.operator === "lt" ? "<" : "="} ${rule.threshold} (channel: ${rule.channel})`;
    if (rule.channel === "slack" || rule.channel === "both") {
      await sendSlackNotification(message);
    }
    // email would go here when implemented
    console.log("[alert]", message);
  }
}
